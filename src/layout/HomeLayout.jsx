import React from "react";
import Navbar from "../components/Navbar";
import Header from "../components/Header";
import Movies from "../components/Movies";
import Series from "../components/Series";

function HomeLayout() {
  return (
    <div>
        <Header/>
        <Movies/>
        <Series/>
    </div>
  );
}

export default HomeLayout;
