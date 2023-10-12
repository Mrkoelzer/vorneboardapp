import React, { useState, useEffect } from "react";
import swal from "sweetalert";
import { ipaddrcontext } from '../contexts/ipaddrcontext';
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import { useNavigate } from 'react-router-dom';
import "../Css/Pin.css";

function Pin() {
  const [input, setInput] = useState("");
  const [layoutName, setLayoutName] = useState("default");
  const navigate = useNavigate();
  const onChange = (newInput) => {
    setInput(newInput);
  };

  const onKeyPress = (button, localipaddr) => {
    if (button === "{clear}") {
      handleClear();
      return;
    }

    if (button === "{bksp}") {
      if (input.length > 0) {
        setInput(input.slice(0, -1));
      }
      return;
    }

    if (input.length < 4) {
      setInput(input + button);
    }

    if (input.length === 3) {
      onSubmitHandler(input + button, localipaddr);
    }
  };

  const handleClear = () => {
    setInput("");
  };

  const onSubmitHandler = async (pin, localipaddr) => {
    try {
      const response = await fetch(`http://${localipaddr}:1435/api/getpin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pin }),
      });

      const data = await response.json();
      if (data.pinauthenticated) {
        navigate(`/Lineeditor`);
      } else {
        swal("Invalid PIN!", "The PIN you entered didn't match. Try again", "error");
        handleClear();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    // You can perform any side-effects or setup here if needed
    // For example, if you want to configure the keyboard or initialize some values
  }, []);

  return (
    <ipaddrcontext.Consumer>
      {context => {
        const { localipaddr } = context;
        return (
          <div className="Pin home-container">
            <div className="text white-text">
              <h2 id="todaysDate"> </h2>
            </div>
            <div className="pin-input">
              {[...Array(4)].map((_, index) => (
                <div key={index} className={`pin-box ${input.length > index ? 'filled' : ''}`}>
                  {input[index]}
                </div>
              ))}
            </div>
            <Keyboard
              layoutName={layoutName}
              theme="hg-theme-default hg-theme-numeric hg-layout-numeric numeric-theme"
              layout={{
                default: ["1 2 3", "4 5 6", "7 8 9", "{clear} 0 {bksp}"]
              }}
              mergeDisplay
              display={{
                "{clear}": "Clear",
                "{bksp}": "⌫"
              }}
              maxLength={4}
              onKeyPress={button => onKeyPress(button, localipaddr)}
              onChange={input => onChange(input)}
            />
          </div>
        );
      }}
    </ipaddrcontext.Consumer>
  );
}

export default Pin;
