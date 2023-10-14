# Setup and scripts

### npm install
Installs all necessary dependencies.

### npm start
Starts the server.

### npm run reset
Resets database with data from db/data.json file.

### npm run production
Starts the server in production mode.

---

# API Documentation

#### Document object scheme
```
{
    _id: "data",
    name: "data",
    content: "data"
}
```

## Routes 
#### GET "/"
    Returns all document objects in an array.
    

#### POST "/"
    Insert a new document in the database.
    
    Returns the new document object including the new _id value.
    name is required but content is optional.

        
#### PUT "/"
    Updates the altered data of the document object sent in the request body.
    _id cannot be altered and is required.
    name or content or both can be included, but atleast one is required. The value of the properties passed in the body of the request will be the new values of the document object. If one is excluded its value will remain unchanged.
    
    Returns no data

#### DELETE "/:id"
    Parameter:
        - _id of target document
    
    Returns no data