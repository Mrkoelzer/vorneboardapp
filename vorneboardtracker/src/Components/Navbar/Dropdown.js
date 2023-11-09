import React, { useState, useContext } from 'react';
import './Dropdown.css';
import { Link } from 'react-router-dom';
import { linescontext } from '../../contexts/linescontext';
import { selectedlinecontext } from '../../contexts/selectedlinecontext';

function Dropdown() {
  const [click, setClick] = useState(false);
  const { lines } = useContext(linescontext);
  const { setselectedline } = useContext(selectedlinecontext)
  
  const handleClick = () => setClick(!click);

  const handlenavigate =(index)=> {
    setselectedline(lines[index].Linename);
    setClick(false)
  }

  return (
    <>
      <ul
        onClick={handleClick}
        className={click ? 'dropdown-menu clicked' : 'dropdown-menu'}
      >
        {lines.map((item, index) => {
          return (
            <li key={index}>
              <Link
                className='dropdown-link'
                onClick={() => handlenavigate(index)}
                to='/lineeditor'
              >
                {item.Linename}
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}

export default Dropdown;