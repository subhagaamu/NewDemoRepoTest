import React from "react";
import './App.css';
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
export default class EntryComponent extends React.Component {
    componentDidMount() {
        document.getElementById("root").style.backgroundColor = "lightGreen";
        var date = new Date();
        var month = date.getMonth();
        var year= date.getFullYear();
        document.getElementById("month").defaultValue = months[month]
        document.getElementById("year").defaultValue = year
    }

    render() {
        return (
            <div> 
                <h4 style={{ textAlign: "center" }}>
                    Welcome to the Entry Page
                </h4>
                    <table >
                        <tr >
                            <td >Employee Name &nbsp;
                            </td>
                            <td>
                                <select>
                                    <option value="Select" selected>Select..</option>
                                    <option>Suresh B</option>
                                    <option>Venkata G</option>
                                    <option>Murali U</option>
                                    <option>Sravanthi T</option>
                                    <option>Yugandhar K</option>
                                    <option>Vamsi Y</option>
                                    <option>Rajendra P</option>
                                </select>
                            </td>&nbsp;
                            <td>Current Month &nbsp;</td>
                            <td ><input id="month" type="text" value="" readOnly /></td>&nbsp;
                            <td>Current Year &nbsp;</td>
                            <td ><input id="year" type="text" value="" readOnly/></td>
                        </tr>
                    </table >
                    <table style={{margin:" 20px 200px 20px 200px"}}>
                    <thead>
                        <th>Current Week</th>
                        <th>Task Name</th>
                        <th>Total Hours</th>
                        <th>No. of Leave</th>
                    </thead>
                    <tbody>
                        <tr>
                            <td><select>
                                    <option value="Select" selected>Select..</option>
                                </select></td>
                            <td><textarea type="text"></textarea></td>
                            <td><input type="number" max="40"/></td>
                            <td><input type="number"/></td>
                        </tr>
                    </tbody>
                    </table>
            </div>
        )
    }

}





