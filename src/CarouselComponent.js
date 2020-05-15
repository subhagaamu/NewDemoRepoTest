import React from 'react';
import { Link } from 'react-router-dom';
import imgae1 from './Assets/workingmen.jpg';
import imgae2 from './Assets/workingwomen.jpg'
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";

export default class CarouselComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            coroselview: true
        }
    }
    handleCarousel() {
        this.setState({ coroselview: false })

        // document.getElementById("root").style.backgroundColor="lightGreen"
    }
    render() {
        return (
            <div>
                {this.state.coroselview && <div>
                    <div style={{ float: "right" }}>
                        <Link to="/EntryPage" onClick={() => {
                            this.handleCarousel()
                        }}>Create Entry</Link>
                    </div>
                    <Carousel autoPlay interval={3000} transitionTime={1000} infiniteLoop={true}>
                        <div>
                            <img alt="" src={imgae1} />
                            <p className="legend">Legend 1</p>
                        </div>
                        <div>
                            <img alt="" src={imgae2} />
                            <p className="legend">Legend 2</p>
                        </div>
                    </Carousel>
                </div>}
            </div>
        )
    }
}