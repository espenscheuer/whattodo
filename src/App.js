import React, { useState, useEffect } from 'react';
import fire from './fire';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import TextField from '@material-ui/core/TextField';
import Checkbox from '@material-ui/core/Checkbox';
import ListSubheader from '@material-ui/core/ListSubheader';
import DateFnsUtils from "@date-io/date-fns";
import { useHotkeys } from 'react-hotkeys-hook';
import Typography from '@material-ui/core/Typography';
import {
  MuiPickersUtilsProvider,
  DatePicker
} from "@material-ui/pickers";
import { makeStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import Popover from '@material-ui/core/Popover';
import Input from '@material-ui/core/Input';
import { set } from 'date-fns';

function App() {

  const useStyles = makeStyles((theme) => ({
    root: {
      width: '100%',
      maxWidth: 360,
      backgroundColor: theme.palette.background.paper,
    },
  }));

  const [items2, setItems2] = useState({})
  const [task, setTask] = useState("")
  const [sort, setSort] = useState("date")
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [edit, setEdit] = useState("")
  const[pop, setPop] = useState({"key":"djkslgjfdlskg", "text":"fdafdsafdsa"});

  useEffect(() => {
    setEdit(pop.text) 
  }, [pop])


  function handleClick(event, item){
    setPop(item)
    setAnchorEl(event.currentTarget)
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);


  useHotkeys('b', () => console.log("b"));
  useHotkeys('a', ()=>setSort("alpha"));
  useHotkeys('d', ()=>setSort("date"));


  function changeDate(date, id){
    fire.firestore().collection("data").doc(id).set({
      due: date
    }, { merge: true });
  }

  function changeText(text, id){
    fire.firestore().collection("data").doc(id).set({
      text: text
    }, { merge: true });
    setAnchorEl(null);
  }

  function shouldSort(items){
    var allItems2 = []
    var curr = items
    if(sort == "alpha") {
      Object.keys(items).map(section => {
        console.log('alpha')
        allItems2[section] = (curr[section].sort((a,b)=>a.text.localeCompare(b.text)))
      })
    } else if(sort=="date") {
      Object.keys(items).map(section => {
        console.log('date')
        allItems2[section] = (curr[section].sort((a,b)=> {
          if(!a.due){
            return (-1) 
          } else if(!b.due){
            return(1)
          } else {
            return(a.due.toDate() - b.due.toDate())
          }
        }))
      })
    }
    setItems2(allItems2)
  }

  useEffect(() => {
    if (Object.keys(items2)) {
      shouldSort(items2) 
    }  
  }, [sort])

  useEffect(() => {
    const unsubscribe = fire
      .firestore()
      .collection("data")
      .orderBy("section")
      .onSnapshot(snapshot => {
        if (snapshot.size) {
          const allItems2 = {}
          snapshot.forEach(item => {
            if (item.data().section){ 
              if (item.data().section in allItems2){
                allItems2[item.data().section].push({
                  key:item.id,
                  text: item.data().text,
                  section: item.data().section,
                  due: item.data().due,
                })
              } else {
                allItems2[item.data().section] = []
                allItems2[item.data().section].push({
                  key:item.id,
                  text: item.data().text,
                  section: item.data().section,
                  due: item.data().due,
                })
              }
            }
          })
          shouldSort(allItems2)
        } else {
        }
      })
      return () => {
      unsubscribe()
    }
  }, [fire])
  
  function deleteItem(id){
    setAnchorEl(null);
    fire.firestore().collection("data").doc(id).delete().then(function() {
      console.log("Document successfully deleted!");
    }).catch(function(error) {
      console.error("Error removing document: ", error);
    });
  }

  function addItem(task){
    var section = ""
    var check = false
    for (let i = 0; i < task.length; i++) {
      if(task[i] === " ") {
        check = false
      }
      if(check){
        section = section + task[i]
      } 
      if(task[i] === "/"){
        check = true
      }
    }
    if(!section){
      section = "Inbox"
    }
    fire.firestore().collection("data").add({
      text: task.replace(("/" + section), ""),
      section: section
    })
    .then(function() {
        console.log("Document successfully written!");
    })
    .catch(function(error) {
        console.error("Error writing document: ", error);
    });
  }
  return (
    <div style ={{marginTop: 60, marginLeft: 60}}>
      <Popover
        id={'pop'}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        transformOrigin={{
          vertical: 23,
          horizontal: 57, 
        }}
      >
      <div> 
        <List>
            <ListItem key = {pop.key}>
              <Checkbox onClick = {()=>{deleteItem(pop.key)}}/>
              <ListItemText primary={
                <TextField id="outlined-basic"
                value={edit}
                onChange={e => {setEdit(e.target.value)}}
                onKeyDown = {(e)=>{
                  if(e.key == 'Enter'){
                    changeText(edit, pop.key)
                  }
                }}
                />     
              } secondary={
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                
                <DatePicker
                  disableToolbar
                  variant="inline"
                  format="MM/dd/yyyy"
                  margin='none'
                  id={"pop-picker-inline" + pop.key}
                  value={pop.due ? pop.due.toDate() : null}
                  emptyLabel="whenever"
                  onChange={(date) => {
                    changeDate(date, pop.key)}
                  }
                  InputProps={{
                      disableUnderline: true,
                      style: {
                      color: "gray",
                      fontSize: 13,
                      disableUnderline: true,
                      width: 65,
                      }
                  }}
                />
                
            </MuiPickersUtilsProvider>  
              
              }/>
            </ListItem>
          </List>
        </div>
      </Popover>
      <TextField id="outlined-basic" label="Enter Task" variant="outlined" 
        value={task}
        onChange={e => {setTask(e.target.value)}}
        onKeyDown = {(e)=>{
          if(e.key == 'Enter'){
            addItem(task)
            setTask('')
          }
        }}
        />
      
      {Object.keys(items2) && Object.keys(items2).map(section => {
        return(
        <List className={classes.root} subheader={
          <ListSubheader component="div" id="nested-list-subheader">
            {section}
          </ListSubheader>
        }>
          {items2[section].map(item => {
            return(
            <>
            <ListItem key = {item.key}>
              <Checkbox onClick = {()=>{deleteItem(item.key)}}/>
              <ListItemText primary={
                <Typography onClick={(event)=>{
                  handleClick(event, item)
                  }
                }>
                  {item.text}
                </Typography>     
              } secondary={
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                
                <DatePicker
                  disableToolbar
                  variant="inline"
                  format="MM/dd/yyyy"
                  margin='none'
                  id={"date-picker-inline" + item.key}
                  value={item.due ? item.due.toDate() : null}
                  emptyLabel="whenever"
                  onChange={(date) => {
                    changeDate(date, item.key)}
                  }
                  InputProps={{
                      disableUnderline: true,
                      style: {
                      color: "gray",
                      fontSize: 13,
                      disableUnderline: true,
                      width: 65,
                      }
                  }}
                />
                
            </MuiPickersUtilsProvider>  
              
              }/>
            </ListItem>
          </>
          )
          })}
        </List>
        )}
      )}
    </div>

  );
}

export default App;
