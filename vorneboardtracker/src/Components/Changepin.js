import React, { Component, useContext } from "react";
import PinInput from "react-pin-input";
import moment from "moment";
import swal from "sweetalert";
import { ipaddrcontext } from '../contexts/ipaddrcontext';
import { usercontext } from '../contexts/usercontext';
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import "../Css/Pin.css"

class Pin extends Component {
  state = {
    input: "",
    currentTime: moment().format("LT"),
    layoutName: "default",
    text: "Enter Old Pin",
    oldpin: false,
    newpin: false,
    newpinvalue: ""
  };

  onChange = (input) => {
    this.setState({
      input: input   
    });
  };

  onKeyPress = (button, localipaddr, userdata) => {
    //console.log("Button pressed", button);

    if (button === "{clear}") {
      this.handleClear();
      return;
    }

    if (button === "{bksp}") {
      if (this.pin.elements[3].state.value) {
        this.pin.elements[3].state.value = "";
        return;
      }
      if (this.pin.elements[2].state.value) {
        this.pin.elements[2].state.value = "";
        return;
      }
      if (this.pin.elements[1].state.value) {
        this.pin.elements[1].state.value = "";
        return;
      }
      if (this.pin.elements[0].state.value) {
        this.pin.elements[0].state.value = "";
        return;
      }
    }

    if (this.pin.elements[2].state.value) {
      this.pin.elements[3].state.value = button;
      let input = (this.pin.elements[0].state.value+this.pin.elements[1].state.value+this.pin.elements[2].state.value+this.pin.elements[3].state.value)
      this.onSubmitHandler(input, localipaddr, userdata)
      return;
    }
    if (this.pin.elements[1].state.value) {
      this.pin.elements[2].state.value = button;
      return;
    }
    if (this.pin.elements[0].state.value) {
      this.pin.elements[1].state.value = button;
      return;
    }
    this.pin.elements[0].state.value = button;
  };

  handleClear = () => {
    this.state.input = "";
    this.keyboard.clearInput();
    this.pin.clear()
  }

  handleShift = () => {
    let layoutName = this.state.layoutName;

    this.setState({
      layoutName: layoutName === "default" ? "shift" : "default"
    });
  };

  onChangeInput = (event) => {
    let input = event.target.value;
    this.setState(
      {
        input: input
      },
      () => {
        this.keyboard.setInput(input);
      }
    );
  };

  onSubmitHandler = async (pin, localipaddr, userdata) => { 
    try {
      if (this.state.oldpin === false) {
        if(userdata.pin === parseInt(pin)){
            this.setState({
                oldpin: true,
                text: "Enter New Pin"
              });
              this.handleClear();
              return;
        }
        else{
            this.setState({
                text: "Incorrect Pin"
              });
              this.handleClear();
              return;
        }
      }
      if (this.state.oldpin === true && this.state.newpin === false) {
        this.setState({
          newpin: true,
          text: "Confirm New Pin",
          newpinvalue: pin
        });
        this.handleClear();
        return;
      }
      if (this.state.newpin === true) {
        if(pin === this.state.newpinvalue){
            let username = userdata.username
           const response = await fetch(`http://${localipaddr}:1435/api/updatepin`, {
           method: 'POST',
           headers: {
             'Content-Type': 'application/json',
           },
           body: JSON.stringify({ pin, username }),
         });
            this.setState({
                text: "Good"
              });
              this.handleClear();
              this.props.closePopup(true);
        }
        else{
            this.setState({
                text: "Pins Don't Match",
                newpin: false
            });
            this.handleClear();
            return;
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  inputStyle = {
    width: "100%",
    height: "100px",
    padding: "10px",
    fontSize: 20,
    border: 0,
    background: "#000",
    margin: "30px 0px 0px",
    color: "#fff",
    textAlign: "Center"
  };

  render() {
    return (
      <ipaddrcontext.Consumer>
        {(ipContext) => (
          <usercontext.Consumer>
            {(userContext) => {
              const { localipaddr } = ipContext;
              const { userdata } = userContext;

              return (
                <div className="Pin home-container">
                  <div className="pintext">
                    {this.state.text}
                  </div>
                  <div className="text white-text">
                    {/* Content for text */}
                  </div>
                  <PinInput
                    length={4}
                    focus
                    ref={(p) => (this.pin = p)}
                    type="numeric"
                    inputMode="number"
                    pattern="\d*"
                    value={this.state.input}
                    onChange={this.onChange.bind(this)}
                  />
                  <Keyboard
                    keyboardRef={(r) => (this.keyboard = r)}
                    layoutName={this.state.layoutName}
                    theme="hg-theme-default hg-theme-numeric hg-layout-numeric numeric-theme"
                    layout={{
                      default: ["1 2 3", "4 5 6", "7 8 9", "{clear} 0 {bksp}"],
                    }}
                    mergeDisplay
                    display={{
                      "{clear}": "Clear",
                      "{bksp}": "&#8592",
                    }}
                    maxLength={4}
                    onKeyPress={(button) =>
                      this.onKeyPress(button, localipaddr, userdata)
                    }
                    onChange={(input) => this.onChange(input)}
                  />
                </div>
              );
            }}
          </usercontext.Consumer>
        )}
      </ipaddrcontext.Consumer>
    );
  }
}
export default Pin;
