import React from "react";
import Navbar from "../components/Navbar";
import Header from "../components/Header";
import Movies from "../components/Movies";
import Series from "../components/Series";
import NewMovies from '../components/NewMovies'
import Footer from '../components/Footer'

function HomeLayout() {
  return (
    <div>
        <Header/>
        <NewMovies/>
        <Movies/>
        <Series/>
        <Footer/>

    </div>
  );
}

export default HomeLayout;
