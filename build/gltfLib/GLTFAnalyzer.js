var $this;
var group = [];
var keyFound = false;
var valueFound = false;
var objFound;
var scenes = [];
var groupNameUUID = [];
var groupParentNameUUID = [];

var parent;

class GLTFAnalyzer {

  constructor() {
    $this = this;
  }

  getSceneObjects(scene){
    let objs;
    if(typeof scene.children == 'object'){
      for(let child in scene.children){
        if(scene.children[child].name == 'Scene' && scene.children[child].type == 'Group'){
          objs = scene.children[child];
          return objs.children
        }
      }
    }
  }

  findObjectByName(sceneObjects, name){
    for(let obj in sceneObjects){
      if(sceneObjects[obj].name == name){
        objFound = sceneObjects[obj];
      }
      if(typeof sceneObjects[obj].children == 'object'){
        $this.findObjectByName(sceneObjects[obj].children, name)
      }
    }
    return objFound;
  }

  findObjectByUUID(sceneObjects, uuid){
    for(let obj in sceneObjects){
      if(sceneObjects[obj].uuid == uuid){
        objFound = sceneObjects[obj];
      }
      if(typeof sceneObjects[obj].children == 'object'){
        $this.findObjectByUUID(sceneObjects[obj].children, uuid)
      }
    }
    return objFound;
  }

  getUUIDNameGroup(obj){
    if(obj.children.length > 0){
      obj.children.forEach((child) => {
        if(typeof child == 'object'){
          $this.arrayFilter(groupNameUUID, $this.setUUIDAndNameJson(obj));
          groupNameUUID.push($this.setUUIDAndNameJson(child));
          $this.getUUIDNameGroup(child)
        }
      });
    }
    return groupNameUUID;
  }

  getSceneObjectsUUIDAndName(sceneObjects){
    return $this.getUUIDNameGroup(sceneObjects)
  }

  // DOWN IN GROUP
  includeValueInProps(val, json) {
    if(!valueFound){
      for(let obj in json){
        if(json[obj] == val){
          valueFound = true;
        }
        if(typeof json[obj] == 'object'){
          $this.includeValueInProps(val, json[obj])
        }
      }
    }
    return valueFound;
  }

  includeKeyInProps(key, json) {
    if(!keyFound){
      for(let obj in json){
        if(obj == key){
          keyFound = true;
        }
        if(typeof json[obj] == 'object'){
          $this.includeKeyInProps(key, json[obj])
        }
      }
    }
    return keyFound;
  }

  findParent(sceneObjects, uuid){
    let object = $this.findObjectByUUID(sceneObjects, uuid)
    let parents = [];
    while(object.parent && object.parent.name != 'Scene' && object.parent.type != 'Scene'){
      parents.push(object.parent)
      object = parents[parents.length-1]
    }
    return parents[parents.length-1]
  }

  //UP IN GROUP
  findVisibilityInLegacy(object){
    let parents = [];
    let oneParentHidden = false;
    while(object.parent){
      parents.push(object.parent)
      object = parents[parents.length-1]
    }
    parents.forEach((parent) => {
      // peut chercher autre chose que visibility
      if(!parent.visible){
        oneParentHidden = true
      }
    });
    return oneParentHidden
  }

  resetGroupNameUUID(){
    groupNameUUID = []
  }

  resetObjFound(){
    objFound = "";
  }

  setUUIDAndNameJson(obj){
    let json = {};
    json.uuid = obj.uuid;
    json.name = obj.name;
    return json;
  }

  arrayFilter(array, json){
    var included = false;
    for(let index in array){
      if(array[index].uuid == json.uuid){
        included = true
      }
    }
    if(!included){
      array.push(json)
    }
  }



}

export {GLTFAnalyzer}
