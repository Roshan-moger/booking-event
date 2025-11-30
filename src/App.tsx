import { BrowserRouter } from "react-router-dom";
import Router from "./Router";
import { Toaster } from "react-hot-toast";


function App() {
  return (
    <>
     
 <BrowserRouter>

      <div className="App">
        <Router />
       <Toaster/>
      </div>
    </BrowserRouter>
    </>
  );
}

export default App;
