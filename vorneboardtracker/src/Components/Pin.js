import React, { Component, useContext } from "react";
import PinInput from "react-pin-input";
import moment from "moment";
import swal from "sweetalert";
import { ipaddrcontext } from '../contexts/ipaddrcontext';
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import "../Css/Pin.css"

class Pin extends Component {
  state = {
    input: "",
    currentTime: moment().format("LT"),
    layoutName: "default"
  };

  onChange = (input) => {
    this.setState({
      input: input   
    });
  };

  onKeyPress = (button, localipaddr) => {
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
      console.log(input)
      this.onSubmitHandler(input, localipaddr)
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

  onSubmitHandler = async (pin, localipaddr) => { 
    try {
        console.log('getting here')
         const response = await fetch(`http://${localipaddr}:1435/api/getpin`, {
           method: 'POST',
           headers: {
             'Content-Type': 'application/json',
           },
           body: JSON.stringify({ pin }),
         });
   
         const data = await response.json();
         if (data.pinauthenticated) {
            window.location.href = `http://${localipaddr}:3000/Lineeditor`;
         } else {
            swal("Invalid PIN!", "Pin you enter didn't match. Try again", "error");
            this.handleClear();
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
        {(context) => {
          const { localipaddr } = context;
    return (
      <div className="Pin home-container">
        <div className="text white-text">
          <h2 id="todaysDate"> </h2>
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
          theme={
            "hg-theme-default hg-theme-numeric hg-layout-numeric numeric-theme"
          }
          layout={{
            default: ["1 2 3", "4 5 6", "7 8 9", "{clear} 0 {bksp}"]
          }}
          mergeDisplay
          display={{
            "{clear}": "Clear",
            "{bksp}": "&#8592"
          }}
          maxLength={4}
          onKeyPress={(button) => this.onKeyPress(button, localipaddr)}
          onChange={(input) => this.onChange(input)}
          
        />
      </div>
       );
      }}
      </ipaddrcontext.Consumer>
    );
  }
}
export default Pin;
