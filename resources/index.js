import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { BrowserRouter as Router } from "react-router-dom";
import axios from "axios";
import { requestInterceptor } from "./utils/axiosInterceptor";

axios.interceptors.request.use(requestInterceptor);

ReactDOM.render(
    <Router>
        <App />
    </Router>,
    document.getElementById("root")
);
