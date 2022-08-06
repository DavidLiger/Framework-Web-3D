# Framework-Web-3D
This software layer overlays Three.js and takes care of automating the basic tasks inherent in any project using Three.js. It sets the position of the scene, the camera, the orbitControllers, the lighting. It also provides interactivity by supporting event clicking on 3D elements. It supports the management of animations. It manages rendering with post-processing and outline. It manages the display of video on objects with different levels of quality, which makes it possible to create TV or computer screens. All parameters are managed from a json file.

# Installation
Copy and paste this folder to the root of your server.
The best way to understand is by example. This repository is a clone of my personal folio.

# Usage
In the folder /src/folio/assets/glb you will find a file package.json. It contains the settings for the scene. The scene representing two people in a flying car around the Earth is open source, you can use it as you like. 

# Settings
- "sceneURI" : target the location of the glb file
- "sceneContainer" : targets the element that will contain the 3D scene
- "backgroundURI" : validates or not the use of a background image and gives its location
- "camera" : sets the various parameters and the position of the camera
- "rotation" : sets the scene rotation
- "autoRotation" : triggers a continuous rotation of the stage and sets its speed
- "UIHelper" : opens a window that lets users know how to manipulate the 3D scene see /build/MVCCompenents/ViewComponent/UIHelper
- "perfHelper" : opens a window that display fps performance see /build/MVCCompenents/ViewComponent/PerfHelper
- "flyThrough" : option to make objects disappear from the scene before collision, keeping some visible if necessary (experimental)
- "controls" : manages the position from which the scene is manipulated by the user (orbitControls)
- "interactiveObjects": designates the objects (by the object name assigned in the scene created in Blender) and the associated interactions according to the event.
              possible options for mousemove : pointerCursor, outline.
              For mousedown: playAnim, playAnimThenModal, playAnimThenModalThenVideo, modal (a more detailed tutorial is in preparation)
- "animationPlayer": contains each animation linked to an event, the non-designated animations are played in a loop at the opening of the 3D scene (a more detailed                       tutorial is in preparation)
- "stats" : three js native stats module
- "zoomAnimate" : automatically zooms to the centre of the scene when the page is opened
- "shadowLight" : lightnings of the scene
- "outline" : if necessary add a outline around the elements of the 3D scene
- "clickOutline" : if necessary add a different outline around certains elements of the 3D scene when mouse is over
- "postProcessing" : allows you to set different renderings such as black and white
- "audioPlayer" : small audio player to add a sound atmosphere to the scene
