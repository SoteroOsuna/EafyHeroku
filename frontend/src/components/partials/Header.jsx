import React from "react";
import { Link, NavLink } from "react-router-dom";

function Header() {
    return (
        <header>
            {/*
            <ul className="nav nav-tabs mb-3 " id="myTab" role="tablist">
                <li class="nav-item">
                    <a class="nav-link" nav-link-color="primary" id="home-tab" data-toggle="tab" href="/" role="tab" aria-controls="home" aria-selected="true">Home</a>
                </li>
                <li className="nav-item">
                    <Link to="/login" class="nav-link" aria-current="page">Login</Link>
                </li>
                <li class="nav-item">
                    <a class="nav-link" id="registro-tab" data-toggle="tab" href="/registro" role="tab" aria-controls="registro" aria-selected="false">Registro</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" id="dashboard-tab" data-toggle="tab" href="/dashboard" role="tab" aria-controls="dashboard" aria-selected="false">Dashboard</a>
                </li>
            </ul>
            <div class="tab-content">
                <div class="tab-pane fade show active" id="" role="tabpanel" aria-labelledby="home-tab"></div>
                <div class="tab-pane fade show active" id="registro" role="tabpanel" aria-labelledby="registro-tab"></div>
                <div class="tab-pane fade show active" id="dashboard" role="tabpanel" aria-labelledby="dashboard-tab"></div>
            </div>*/}
            <nav class="navbar navbar-expand-lg navbar-light bg-light">
                <div class="container-fluid">
                    <a href="#" class="navbar-brand">EafySolutions</a>
                    <button type="button" class="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#navbarCollapse">
                        <span class="navbar-toggler-icon"></span>
                    </button>

                    <div class="collapse navbar-collapse" id="navbarCollapse">
                        <div class="navbar-nav">
                            <a href="/" class="nav-item nav-link active">Inicio</a>
                            <a href="/registro" class="nav-item nav-link">Registro</a>
                            <a href="/login" class="nav-item nav-link">Login</a>
                            <a href="/dashboard" class="nav-item nav-link">Dashboard</a>
                        </div>
                        {/*
                        <div class="navbar-nav ms-auto">
                            <a href="/" class="nav-item nav-link">Logout</a>
                        </div>
                        */}
                    </div>

                </div>
            </nav>
        </header>
    );
}

export default Header;