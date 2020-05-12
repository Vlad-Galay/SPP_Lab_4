import React, { useState, Fragment } from 'react'
import AddcompForm from './forms/AddcompForm'
import EditcompForm from './forms/EditcompForm'
import UserTable from './tables/UserTable'
import Sample from './sample'



const socketIO = require("socket.io-client");

let firstInit = false;

var socket=socketIO('ws://localhost:8080');

let App = () => {

	// Data
	let compsData = [];

	let [ compInfo, setUserInfo] = useState({isAuth : true, nick : "nick", token : "token"})


	let initialFormState = { id: null, mark: '', model: '', year: ''}

	// Setting state
	let [ comps, setcomps ] = useState(compsData)
	let [ currentcomp, setCurrentcomp ] = useState(initialFormState)
	let [ editing, setEditing ] = useState(false)




	socket.on("get_data", comps => {
		setcomps(JSON.parse(comps));
	})

	socket.on("change_data", comps => {
		setcomps(JSON.parse(comps));
	})




	if (firstInit !== true  && compInfo.isAuth){
		socket.emit("GET");
		firstInit = true;
		
	}




	
	let addcomp = comp => {
		comp.id = comps.length + 1
		//setcomps([ ...comps, comp ])


		let json = JSON.stringify({id : comp.id, mark : comp.mark, model : comp.model, year : comp.year})
		console.log(json);
		socket.emit("POST", json);
		


	}

	let deletecomp = id => {
		setEditing(false)


		socket.emit("DELETE", id);
		

	}

	let updatecomp = (id, updatedcomp) => {
		setEditing(false)

		let json = JSON.stringify({id : updatedcomp.id, mark : updatedcomp.mark, model : updatedcomp.model, year : updatedcomp.year})
		socket.emit("PUT", json);

		
	}

	let editRow = comp => {
		setEditing(true)

		setCurrentcomp({ id: comp.id, mark: comp.mark, model: comp.model, year: comp.year })
	}

	let qw = (x) => {
		localStorage.setItem("nick", x.nick);
		localStorage.setItem("token", x.token);
		setUserInfo(x);
	}

	let OnLogOut = () => {
		localStorage.removeItem("nick");
		localStorage.removeItem("token");
		firstInit = false;
		setcomps([]);
		setUserInfo({isAuth : false, nick : "", token : ""});
	}

	return (
		<div className="container">	
			

			{
				compInfo.isAuth ? 
					(<div>
						Hello, {compInfo.nick}
						<br></br>
						<button onClick={OnLogOut}> LogOut </button>
					</div>
					)
						: 
					<Sample handle={qw}/>
			}
			<h1>Computer management</h1>
			<div className="flex-row">
				<div className="flex-large">
					{editing ? (
						<Fragment>
							<h2>Edit comp</h2>
							<EditcompForm
								editing={editing}
								setEditing={setEditing}
								currentcomp={currentcomp}
								updatecomp={updatecomp}
							/>
						</Fragment>
					) : (
						<Fragment>
							<h2>Add computer</h2>
							<AddcompForm addcomp={addcomp} />
						</Fragment>
					)}
				</div>
				<div className="flex-large">
					<h2>View computers</h2>
					<UserTable comps={comps} editRow={editRow} deletecomp={deletecomp} />
				</div>
			</div>
		</div>
	)
}

export default App
