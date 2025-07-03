import React,{useState} from "react";
import Navigation from "./components/Navigation";

function App() {
  const [activeTab,setActiveTab] = useState('home');
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navigation />
    </div>
  );
}

export default App;
