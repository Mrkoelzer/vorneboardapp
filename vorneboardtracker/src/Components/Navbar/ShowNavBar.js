import react, {useEffect, useState} from 'react';
import { useLocation } from 'react-router-dom';

const ShowNavBar = ({ children }) => {

    const location = useLocation();
    const [showNavBar, setShowNavBar] = useState(false);
    
    useEffect(() => {
        if (location.pathname === '/LineView') {
            setShowNavBar(false);
        } else {
            setShowNavBar(true);
        }
    }, [location.pathname]);

    return (
        <div>{showNavBar && children}</div>
    )

}

export default ShowNavBar