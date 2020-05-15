import React from "react";
import './App.css';
import axios from "axios";
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
var jsonFormat = [];
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
var hrs = [];
var hrsexcel=[]
var finalExceldata = []
var jsonFiledata = {}
var summaryTable = []
var finalData = {};
var Hcount = 0
var Lcount = 0
var Fcount = 0

export default class EntryComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            employeeNames: ["Suresh", "Venkat", "Yugandhar", "Murali", "Vamsi", "Sravanthi", "Amaleshwar", "Giridhar"],
            populateWeeks: [],
            populateTaskName: ["IMT Enhancement -59572", "FFGEN Enhancements- 0000"],
            setName: "",
            month: "",
            year: "",
            cmp: "",
            hours: [],
            message: false,
            weekSelected: "",
            taskSelected: "",
            hrsSelected: "",
            leaveSelected: "",
            fileName: "",
            tablerow: false,
            columnNames: [],
            totalWeekHours: "",
            JSONdata: [],
            submit: true,
            Holiday: "",
            Forlough: ""
        }
    }
    componentDidMount() {
        // document.getElementById("root").style.backgroundColor = "lightGreen";
        var date = new Date();
        var month = date.getMonth();
        var year = date.getFullYear();
        document.getElementById("month").value = months[month]
        document.getElementById("year").value = year
        var firstDate = new Date(year, month, 1);
        var lastDate = new Date(year, month + 1, 0);
        var totalDays = lastDate.getDate();
        var weeks = this.getWeeksStartAndEndInMonth(firstDate, month, year, totalDays)
        this.setState({ populateWeeks: (weeks) })
        var fileName = months[month] + year;
        var Employees = this.state.employeeNames
        axios.post("http://localhost:8000/checkFileExists", { fileName }).then((res) => {
            if (!res.data) {
                for (var i = 0; i < Employees.length; i++) {
                    var employeejson = {};
                    employeejson["SNo"] = i + 1;
                    employeejson["EmployeeName"] = Employees[i];
                    for (var j = 0; j < weeks.length; j++) {
                        employeejson[`Week${j + 1}`] = weeks[j].start + "-" + weeks[j].end;
                        employeejson[`TaskName${j + 1}`] = this.state.taskSelected;
                        employeejson[`TotalWeek${j + 1}hours`] = 0
                    }
                    employeejson["Totalhours"] = 0
                    for (var f = 0; f < totalDays; f++) {
                        employeejson[`day${f + 1}`] = 0;
                    }
                    jsonFormat.push(employeejson)
                }
                finalData["EmployeeJson"] = jsonFormat
                for (var s = 0; s < Employees.length; s++) {
                    var summaryEmployee = {}
                    summaryEmployee["SNo"] = s + 1;
                    summaryEmployee["EmployeeName"] = Employees[s];
                    summaryEmployee["TotalWorkingDays"] = totalDays - (weeks.length * 2);
                    summaryEmployee["Holidays"] = 0
                    summaryEmployee["Leave"] = 0
                    summaryEmployee["ForloughLeave"] = 0
                    summaryEmployee["ActualBusinessWorkingDays"] = totalDays - (weeks.length * 2) - summaryEmployee["Holidays"];
                    summaryEmployee["ActualWorkingDays"] = summaryEmployee["ActualBusinessWorkingDays"] - summaryEmployee["Leave"];
                    summaryTable.push(summaryEmployee)
                }
                finalData["EmployeeSummary"] = summaryTable

                axios.post("http://localhost:8000/writeToJsonFile", { fileName, finalData })
                    .then((res) => {
                        this.setState({ JSONdata: res.data, fileName: fileName })
                        console.log(res.data)
                    })
            }
            else {
                axios.post("http://localhost:8000/readJsonFile", { fileName }).then((res) => {
                    console.log(res)
                    this.setState({ JSONdata: res.data, fileName: fileName })
                })
            }

        })

    }
    getColumName() {
        var start = 0;
        var end = 0;
        var dates = [];
        var columnNamesSplitted = [];
        var weekObject = this.state.weekSelected;
        var splitted = weekObject.split("-");
        // var day=splitted.getDay()
        start = parseInt(splitted[0].split("/")[0]);
        end = parseInt(splitted[1].split("/")[0]);
        for (var x = start; x <= end; x++) {
            dates.push({ colum: start });
            start = start + 1;
        }
        for (var y = 0; y < dates.length; y++) {
            var columnNames = {}
            columnNames['column'] = `day${dates[y].colum}`
            // columnNames['day']=dates[y].day
            columnNamesSplitted.push(columnNames)
        }
        this.setState({ columnNames: columnNamesSplitted });
    }
    handleExport() {
        var fileName = this.state.fileName
        const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
        const fileExtension = '.xlsx';
        var file = {
            "fileName": this.state.fileName
        }
        axios.post('http://localhost:8000/checkExcelFile', { file }).then((res) => {
            if (!res.data) {
                var json = this.state.JSONdata
                var json1 = json.EmployeeJson;
                var json2 = json.EmployeeSummary
                var monthyr = [this.state.month + "," + this.state.year + ""]
                finalExceldata.push(monthyr)
                var finalexcelJsonHeader = json1.map((json) => Object.keys(json))
                finalExceldata.push(finalexcelJsonHeader[0])
                var finalExcelJsonData = json1.map((ele) => Object.values(ele))
                finalExcelJsonData.map((ele) => finalExceldata.push(ele))
                var emptyrow = ["", "", ""];
                finalExceldata.push(emptyrow)
                finalExceldata.push(emptyrow)
                finalExceldata.push(emptyrow)
                var finalexcelSummaryHeader = json2.map((json) => Object.keys(json))
                finalExceldata.push(finalexcelSummaryHeader[0])
                var finalExcelSummaryData = json2.map((ele) => Object.values(ele))
                finalExcelSummaryData.map((ele) => finalExceldata.push(ele))
                const ws = XLSX.utils.json_to_sheet(finalExceldata);
                const wb = { Sheets: { 'data': ws }, SheetNames: ['data'] };
                const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
                const data = new Blob([excelBuffer], { type: fileType });
                FileSaver.saveAs(data, this.state.fileName + fileExtension);
            }
            else {
                console.log(fileName)
                axios.post('http://localhost:8000/deleteExistFile', { fileName }).then(() => {
                    var json = this.state.JSONdata
                    var json1 = json.EmployeeJson;
                    var json2 = json.EmployeeSummary
                    var finalExceldata = []
                    var monthyr = [this.state.month + "," + this.state.year + ""]
                    finalExceldata.push(monthyr)
                    var finalexcelJsonHeader = json1.map((json) => Object.keys(json))
                    finalExceldata.push(finalexcelJsonHeader[0])
                    var finalExcelJsonData = json1.map((ele) => Object.values(ele))
                    finalExcelJsonData.map((ele) => finalExceldata.push(ele))
                    var emptyrow = ["", "", ""];
                    finalExceldata.push(emptyrow)
                    finalExceldata.push(emptyrow)
                    finalExceldata.push(emptyrow)
                    var finalexcelSummaryHeader = json2.map((json) => Object.keys(json))
                    finalExceldata.push(finalexcelSummaryHeader[0])
                    var finalExcelSummaryData = json2.map((ele) => Object.values(ele))
                    finalExcelSummaryData.map((ele) => finalExceldata.push(ele))
                    const ws = XLSX.utils.json_to_sheet(finalExceldata);
                    const wb = { Sheets: { 'data': ws }, SheetNames: ['data'] };
                    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
                    const data = new Blob([excelBuffer], { type: fileType });
                    FileSaver.saveAs(data, this.state.fileName + fileExtension);

                })
            }
        })

    }
    handleName(e) {
        this.setState({ setName: e.target.value, month: document.getElementById("month").value, year: document.getElementById("year").value })
    }
    handleWeek(e) {
        this.setState({ weekSelected: e.target.value, tablerow: true }, () => this.getColumName())
    }
    handleTask(e) {
        this.setState({ taskSelected: e.target.value })
    }
    handleHours(e) {
        this.setState({ hrsSelected: e.target.value })
    }
    handleLeave(e) {
        this.setState({ leaveSelected: e.target.value });
    }
    handleSumbitSave() {
        var weeks = this.state.populateWeeks;
        var splitted = weeks.map((week) => {
            return week.start + "-" + week.end
        })
        var indexweek = splitted.indexOf(this.state.weekSelected)
        var taskSelected = `TaskName${indexweek + 1}`;
        var totalhoursPerweek = `TotalWeek${indexweek + 1}hours`
        var jsondata = this.state.JSONdata;
        console.log(jsondata)
        var jsonFiledata1 = jsondata.EmployeeJson
        var jsonFiledata2 = jsondata.EmployeeSummary
        console.log(jsonFiledata1)
        jsonFiledata1.map((user) => {
            // user["CurrentMonth"]
            if (user.EmployeeName === this.state.setName) {
                user[taskSelected] = this.state.taskSelected;
                user[totalhoursPerweek] = this.state.hrsSelected;
                user["Totalhours"] = user["Totalhours"] + user[totalhoursPerweek]
                var start = 0;
                var end = 0;
                var dates = [];
                var jsonhrs = this.state.hours
                var weekObject = this.state.weekSelected;
                var splitted = weekObject.split("-");
                // var day=splitted.getDay()
                start = parseInt(splitted[0].split("/")[0]);
                end = parseInt(splitted[1].split("/")[0]);
                for (var x = start; x <= end; x++) {
                    dates.push({ colum: start });
                    start = start + 1;
                }
                var jsonhrsarray = []
                hrsexcel.map((jsonhr) => {
                    var keys = Object.keys(jsonhr)
                    keys.forEach((key) => {
                        jsonhrsarray.push(jsonhr[key])
                    })
                })
                for (var y = 0; y < jsonhrsarray.length; y++) {
                    user[`day${dates[y].colum}`] = jsonhrsarray[y]
                }
            }
        })
        var date = new Date();
        var month = date.getMonth();
        var year = date.getFullYear();
        var lastDate = new Date(year, month + 1, 0);
        var totalDays = lastDate.getDate();
        jsonFiledata2.map((user) => {
            if (user.EmployeeName === this.state.setName) {
                user["Holidays"] = this.state.Holiday + user["Holidays"]
                user["Leave"] = this.state.leaveSelected + user["Leave"];
                user["ForloughLeave"] = this.state.Forlough + user["ForloughLeave"];
                user["ActualBusinessWorkingDays"] = totalDays - (weeks.length * 2) - user["Holidays"];
                user["ActualWorkingDays"] = user["ActualBusinessWorkingDays"] - user["Leave"];
            }
        })
        jsonFiledata["EmployeeJson"] = jsonFiledata1
        jsonFiledata["EmployeeSummary"] = jsonFiledata2
        console.log(jsonFiledata1)
        var fileName = this.state.month + this.state.year;
        axios.post("http://localhost:8000/writeToJsonFileSubmit", { jsonFiledata, fileName }).then((res) => {
            console.log(res.data)
            this.setState({ JSONdata: res.data })
            this.setState({ message: true })
        })
    }
    handleReset() {
        window.location.reload();
    }
    handleCalculateTotalHoursandLeave() {
        var hr = 0;
        // var leave = 0
        console.log(hrsexcel)
        // var totalhrs = hrs.map((hr, index) => { return hr[`hour${index}`] })
        var totalhrs = hrs.map((hr) => Object.values(hr))
        console.log(totalhrs)
        for (var i = 0; i < totalhrs.length; i++) {
            hr = parseInt(totalhrs[i]) + hr;
        }
        // for (var j = 0; j < (totalhrs.length) - 2; j++) {
        //     if (parseInt(totalhrs[j]) === 0) {
        //         leave = leave + 1;
        //     }
        // }
        if (this.state.hrsSelected === " " || this.state.hrsSelected === null || this.state.hrsSelected !== hr) {
            this.setState({ hrsSelected: hr, leaveSelected: Lcount, hours: hrs, Holiday: Hcount, Forlough: Fcount })
        }
    }

    handleDayHours(e, index) {
        var hours = {}
        var hour = document.getElementById(`hour${index}`).value;
        if (hour.startsWith("H") || hour.startsWith("h")) {
            console.log(1)
            Hcount = Hcount + 1
        }
        if (hour.startsWith("L") || hour.startsWith("l")) {
            console.log(2)
            Lcount = Lcount + 1
        }
        if (hour.startsWith("F") || hour.startsWith("f")) {
            console.log(3)
            Fcount = Fcount + 1
        }
        if (!(hour.startsWith("h") || hour.startsWith("H") || hour.startsWith("F") || hour.startsWith("f") || hour.startsWith("L") || hour.startsWith("l"))) {
            console.log(4)
            hours[`hour${index}`] = hour
            hrs.push(hours);
        }
        hours[`hour${index}`] = hour
        hrsexcel.push(hours);
    }
    getWeeksStartAndEndInMonth = function (firstDate, month, year, numDays) {
        // let weeks = {start:"",end:""};
        let weeks = [];
        let start = 1;
        var weekStartDate = firstDate.getDate() + '/' + months.indexOf(months[month + 1]) + '/' + year
        let end = 7 - (firstDate.getDay() - 1);
        var weekend = new Date(year, month, end)
        var weekEndDate = weekend.getDate() + '/' + months.indexOf(months[month + 1]) + '/' + year
        while (start <= numDays) {
            weeks.push({ start: weekStartDate, end: weekEndDate });
            // weeks.start=weekStartDate;
            // weeks.end=weekEndDate;
            start = end + 1;
            var weekStart = new Date(year, month, start)
            weekStartDate = weekStart.getDate() + '/' + months.indexOf(months[month + 1]) + '/' + year
            end = end + 7;
            end = start === 1 && end === 8 ? 1 : end;
            if (end > numDays) {
                end = numDays;
            }
            weekend = new Date(year, month, end)
            weekEndDate = weekend.getDate() + '/' + months.indexOf(months[month + 1]) + '/' + year
        }

        return weeks;
    }
    render() {
        var column = this.state.columnNames.map((column, day) => {
            return (<th >{column.column}{column.day}</th>)
        })
        return (
            <div>
                <br></br>
                <h4 style={{ textAlign: "center" }}>
                    Welcome to the Entry Page
                </h4><br></br>
                <table >
                    <tr >
                        <td><label>Employee Name</label>&nbsp;
                        </td>
                        <td>
                            <select className="form-control" onChange={(e) => { this.handleName(e) }}>
                                <option>Select</option>
                                {this.state.employeeNames.map((employee) =>
                                    <option key={employee}>{employee}</option>)}
                            </select>
                        </td>&nbsp;
                            <td><label>Current Month </label>&nbsp;</td>
                        <td ><input className="form-control" id="month" type="text" readOnly /></td>&nbsp;
                            <td><label>Current Year </label>&nbsp;</td>
                        <td ><input id="year" className="form-control" type="text" readOnly /></td>
                    </tr>
                </table ><br></br>
                {<table >
                    <thead>
                        <th>Select Week</th>&nbsp;
                        <th>Task Name</th>&nbsp;
                        <th>Total Hours</th>&nbsp;
                        <th>No. of Leave</th>&nbsp;
                        <th>No. of Holidays</th>&nbsp;
                        <th>No. of Forlough</th>&nbsp;
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <select className="form-control" onChange={(e) => this.handleWeek(e)}>
                                    <option>Select</option>
                                    {this.state.populateWeeks.map((week) =>
                                        <option key={week.start}>{week.start}-{week.end}</option>)}
                                </select>
                            </td>&nbsp;
                            <td>  <select className="form-control" onChange={(e) => { this.handleTask(e) }}>
                                <option>Select</option>
                                {this.state.populateTaskName.map((Task) =>
                                    <option key={Task}>{Task}</option>)}
                            </select></td>&nbsp;
                            <td><input type="number" value={this.state.hrsSelected} className="form-control" max="40" min="0" step={8} onChange={(e) => { this.handleHours(e) }} /></td>&nbsp;
                            <td><input type="number" value={this.state.leaveSelected} className="form-control" min="0" max={5} onChange={(e) => this.handleLeave(e)} /></td>&nbsp;
                            <td><input type="number" value={this.state.Holiday} className="form-control" min="0" max={5} onChange={(e) => this.handleLeave(e)} /></td>&nbsp;
                            <td><input type="number" value={this.state.Forlough} className="form-control" min="0" max={5} onChange={(e) => this.handleLeave(e)} /></td>&nbsp;
                        </tr>
                    </tbody>
                </table>}<br></br>
                {this.state.tablerow && <div style={{ marginLeft: "30px" }}>
                    <table className="table table-bordered">
                        <thead className="thead-dark">
                            <th>EmployeeName</th>
                            {column}
                        </thead>
                        <tr>
                            <td><input type="text" className="form-control" value={this.state.setName} readOnly /></td>
                            {this.state.columnNames.map((column, index) => {
                                return <td><input name={`hour${index}`}
                                    id={`hour${index}`} type="text" onBlur={(e) => this.handleDayHours(e, index)} className="form-control" /></td>
                            })}
                        </tr>
                    </table>
                    <button className="btn btn-primary" onClick={(e) => { this.handleCalculateTotalHoursandLeave() }}>Calculate TotalHours and Leave</button>&nbsp;
                    <button className="btn btn-primary" onClick={(e) => { this.handleReset(e) }}>Reset data</button>&nbsp;
                    <button className="btn btn-primary" disabled={this.state.setName === "" || this.state.weekSelected === "" || this.state.taskSelected === "" || this.state.leaveSelected === "" || this.state.hrsSelected === ""} onClick={(e) => { this.handleSumbitSave(e) }}>Submit</button>
                </div>
                }<br></br>
                {this.state.message && <div className="alert alert-success">
                    Hi <b>{this.state.setName}</b>, your data is entered for the week <b>{this.state.weekSelected}</b>.<br></br>
                </div>}
                {this.state.message && <div >
                    {/* <Link to= {`/ExportExcel/${this.state.JSONdata}`}>Export To excel</Link> */}
                    <button className="btn btn-link" onClick={() => this.handleExport()}>Export Excel</button>
                </div>}
                {/* {this.state.cmp} */}
            </div>
        )
    }

}





