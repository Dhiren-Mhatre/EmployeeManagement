import { useState,useEffect } from "react";
import { Routes, Route, Navigate ,createBrowserRouter,RouterProvider} from "react-router-dom";
import Topbar from "./scenes/global/Topbar";
import Topbar2 from "./scenes2/global/Topbar2";
 
 
import Atendence2 from "./scenes2/attendance2";
import Sidebar2 from "./scenes2/global/Sidebar2";
import Sidebar from "./scenes/global/Sidebar";
 
 
import Team from "./scenes/team";
import Form2 from "./scenes2/form";
import LeaveForm from "./scenes2/leaves";
 
import { useNavigate } from 'react-router-dom';
import Leaves from "./scenes/leaves";
 
import Form from "./scenes/form";
 
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
 
import Attendence from "./scenes/attendance";
import Login from './Login';
 
import Payroll from "./scenes/Payroll";
 
import { useAuth } from "./utilis/AuthContext";




function App() {
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);
  const [isSidebar2, setIsSidebar2] = useState(true);
  const [isLoggedIn, setLoggedIn] = useState(false);
  const [loginType, setLoginType] = useState('');
  const [isSignUpClicked, setIsSignUpClicked] = useState(false);
  const navigate = useNavigate();

  const {currentUser} = useAuth()

  console.log(currentUser)

  const handleLoginClick = (type) => {
    setLoggedIn(true);
    setLoginType(type);
  };
 
  const handleSignUpClick = () => {
   
    console.log('Sign Up clicked!');
    // setIsSignUpClicked(true);
    setLoggedIn(true) // Set the state to true when sign-up button is clicked
    navigate('/signUp');// Set the state to true when sign-up button is clicked
    };

    
  
    useEffect(() => {
      // Redirect to the default route or login page when the component mounts
      navigate('/');
    }, []);


  return (
    
    <div>
      {!isLoggedIn && <Login onLoginClick={handleLoginClick} handleSignUpClick={handleSignUpClick} />}
      {isLoggedIn && (
        <>
          {loginType === 'admin' && (
            <ColorModeContext.Provider value={colorMode}>
              <ThemeProvider theme={theme}>
                <CssBaseline />
                <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
                  <Sidebar isSidebar={isSidebar} />
                  <main className="content">
                    <Topbar setIsSidebar={setIsSidebar} />
                    <Routes>
                    <Route path="/leaves" element={<Leaves />} />
                   
                      <Route path="/team" element={<Team />} />
                      <Route path="/attendance" element={<Attendence />} />
                      <Route path="/form" element={<Form />} />
                      
                    
                      <Route path="/payroll" element={<Payroll />} />
                      <Route path="/" element={<Team />} />
                     
                    </Routes>
                  </main>
                </div>
              </ThemeProvider>
            </ColorModeContext.Provider>
          )}
          {loginType === 'employee' && (
  <ColorModeContext.Provider value={colorMode}>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="app">
        <Sidebar2 isSidebar2={isSidebar2} />
                  <main className="content">
                  <Topbar2 setIsSidebar2={setIsSidebar2}  />
          <Routes>
            <Route path="/" element={<Form2 />} />
             
                      <Route path="/leaves" element={<LeaveForm />} />
                      <Route path="/attendance2" element={<Atendence2/>}/>
            <Route path="/form" element={<Form2 />} />

            
            
          </Routes>
        </main>
      </div>
    </ThemeProvider>
  </ColorModeContext.Provider>
)}


           
        </>
      )}
     
    </div>
    
  );
 
    
  
}

export default App;