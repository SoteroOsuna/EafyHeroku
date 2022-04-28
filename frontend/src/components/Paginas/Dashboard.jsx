import React, { useEffect, useState } from "react";
import * as XLSX from 'xlsx';
import axios from "axios";

function Dashboard(){
    const [items, setItems] = useState([]);
    // To display selected fileName
    const [fileName, setFileName] = useState(null);

    const[input, setInput] = useState ({
        item: "",
        description: "",
        um: "",
        productCode: ""
    });

    const readExcel = (file) => {
        const promise = new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.readAsArrayBuffer(file)

            fileReader.onload = (event) => {
                const bufferArray = event.target.result;
                
                // To display selected fileName
                setFileName(file.name);
                
                const workbook = XLSX.read(bufferArray, {type:'buffer'});
                const wsname = workbook.SheetNames[0];

                const worksheet = workbook.Sheets[wsname];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);
 
                resolve(jsonData);
            };

            fileReader.onerror = (error) => {
                reject(error);
            };
        });

        promise.then((d) => {
            console.log(d);
            setItems(d);
        });
    }

    return(
        <div className="container micontenedor">
                <h1>Dashboard</h1>
                {/*
                {fileName && (
                    <p>
                        Seleccionaste: <span>{fileName}</span>
                    </p>
                )}
                <input type="file" onChange={(event)=>{
                    const file = event.target.files[0];
                    readExcel(file);
                }}/>

                <table class="table">
                    <thead>
                        <tr>
                            <th scope="col">Item</th>
                            <th scope="col">Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        { items.map((d) => (
                            <tr key={d.Item}>
                                <th>{d.Item}</th>
                                <td>{d.Description}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                */}
                <form action="/subirExcel" method="POST" enctype="multipart/form-data">
                    <div class="form-group">
                        <label for="excel">BrowseFile</label>
                        <input type="file" class="form-control" name="excel" required></input>
                        <br></br><br></br>
                        <input type="submit" value="submit"></input>
                    </div>
                </form>
                
        </div>
    );
}

export default Dashboard;