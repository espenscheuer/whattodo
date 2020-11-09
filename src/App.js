import React, { useState, useEffect } from 'react';
import fire from './fire';
import Item from './components/item'

function App() {

  const [items, setItems] = useState([]);

  useEffect(() => {
    // Since firebase runs async, only update state if the app is mounted
    const getItems = () => {
      const allItems = []
      fire
        .firestore()
        .collection("data")
        .get()
        .then(querySnapshot => {
          querySnapshot.forEach(item => {
            allItems.push({
              key: item.data().text, 
            })
          })
        })
        setItems(allItems)
        }
    getItems()
  }, [])

  console.log(items)
  return (
    <div>
        {
          items.map(item => <Item key = {item.key} text = {item.key}/>)
        }
    </div> 
  );
}

export default App;
