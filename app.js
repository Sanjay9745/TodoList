
const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const app = express();
const _ = require("lodash")
require("dotenv").config();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://admin-sanjay:"+process.env.USER_PASS+"@cluster0.3wo8evg.mongodb.net/todoListDB")


const itemsSchema = new mongoose.Schema({
name:String
});
const listsSchema = new mongoose.Schema({
name:String,
items:[itemsSchema]
});
const Item = new mongoose.model("Item",itemsSchema);
const List = new mongoose.model("List",listsSchema);

const item1 = new Item( {
  name:"Press Add Button to Add"
})
const item2 = new Item({
  name:"<- Hit check button to delete"
})
const item3 = new Item({
  name:"change the url to get new directory"
})

const defaultItem = [item1,item2,item3];

app.get("/", function(req, res) {

const day = date.getDate();

async function getItems(){
  try{
    const Items = await  Item.find({});
    return Items
 
  }catch(e){
    console.log(e);
  }
  
}
getItems().then(function(items){

 res.render("list", {listTitle: "Today", newListItems: items});
 
   });

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listTitle = req.body.listTitle ;
 
    const item = new Item({
      name:itemName
    })
    if(listTitle==="Today"){
      if(itemName===""){
        res.redirect("/");
      }else{
        item.save()
      res.redirect("/");
      }
      
    }else{
      async function getLists(){
        try{
          const Items = await  List.findOne({name:listTitle});
    
          return Items
       
        }catch(e){
          console.log(e);
        }
      }
        getLists().then(function(foundItem){
          if(itemName===""){
            res.redirect("/"+listTitle);
          }else{
            foundItem.items.push(item);
              foundItem.save()
              res.redirect("/"+listTitle);
          }
           });
         
  }
 


});

app.post("/delete", function(req,res){
  const itemName = req.body.newItem;
  const itemId = req.body.checkbox;
  const listTitle = req.body.listTitle ;
if(listTitle==="Today"){
  async function deleteItems(){
    try{
       await  Item.deleteOne({_id:itemId});
    }catch(e){
      console.log(e);
    }
    
  }
  deleteItems()
  res.redirect("/");
}else{

  async function getLists(){
    try{
      const Items = await  List.findOne({name:listTitle});

      return Items
   
    }catch(e){
      console.log(e);
    }
  }
    getLists().then(function(foundItem){
      const item = new Item({
        name:itemName
      })
      foundItem.items.pop(item);
          foundItem.save()
          res.redirect("/"+listTitle);
       });
}

});

app.get("/:listName", function(req, res){
  
  const listName =_.capitalize(req.params.listName) ;
  if(listName==="Today"){
    res.redirect("/")
  }else{

  
  async function getLists(){
    try{
      const Items = await  List.findOne({name:listName});

      return Items
   
    }catch(e){
      console.log(e);
    }
    
  }
  getLists().then(function(items){

    if(!items){

        const item= new List({
          name:listName,
          items:defaultItem
        })
        item.save()
      
       res.redirect("/"+listName);
         
    }else{
      
 
      res.render("list", {listTitle: listName, newListItems: items.items});
    }

     });
    }
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
