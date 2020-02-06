(function(){
    'use strict';
    class app {
        constructor(viewer) {

            this.zoom_factor = 1.0;
            this.canvas = document.getElementById('glcanvas');

            //setting up the canvas events
            this.setup_mousewheel();
            this.setup_mouse_events();
            this.setup_drag();
            this.setup_drop();

            //Setting up the viewer
            this.viewer =viewer;
            this.viewer.init(this.canvas);

            // Attempt to display default image
            this.init_default_img();

        }

        // zoom in and zoom out of the image
        setup_mousewheel() {

            this.canvas.onwheel = (function(event) {

                event.stopPropagation();
                event.preventDefault();

                const delta = Math.max(-1, Math.min(1, -event.deltaY));
                this.zoom_factor = Math.min(2.0,Math.max(0.1, this.zoom_factor + delta * 0.1)); /// constrain zooming factor between 10% and 200%

                this.viewer.refresh({zoom:this.zoom_factor});
            }).bind(this);
        }

        // controls the movement of the image with the mouse
        setup_mouse_events(){
            
            let init_coord = null; 
            let being_clicked = false;

            this.canvas.onmousedown = (function(event){
               
               // registers the initial mouse location 
                init_coord={
                    x: event.pageX ,
                    y: event.pageY 
                    }
                 being_clicked = true;    
            })
            this.canvas.onmousemove=(function(event){

                if(being_clicked){
                    let displacement={
                        delta_x:(event.pageX - init_coord.x),
                        delta_y:(event.pageY - init_coord.y)
                    }
                
                    // Reset the initial coordination
                    init_coord={
                        x: event.pageX ,
                        y: event.pageY  
                    }

                    this.viewer.refresh(displacement);

                }
            }).bind(this)

            this.canvas.onmouseup=(function(event){
                being_clicked =false;
            })
            this.canvas.onmouseout=(function(event){
                being_clicked =false;
            })
            this.canvas.ondblclick=(function(event){
                this.viewer.reset_placement()
                this.viewer.refresh();
            }).bind(this)
        }

    
        // Display image using drag and drop
        setup_drag() {
            document.ondragover=(function(event){
                event.stopPropagation();
                event.preventDefault();
                event.dataTransfer.dropEffect = 'copy';
            });
        
        }

        setup_drop() {

            document.ondrop = (function(event){
                event.stopPropagation();
                event.preventDefault();
                const files = event.dataTransfer.files;

                if (files && files.length === 1 && files[0].type.match('image.*')) {
                    const fileReader = new FileReader();

                    fileReader.onloadend = (function (event) {

                        this.img = new Image();
                        this.img.src = event.target.result;
                        this.img.onload = (function(){

                            this.viewer.load_img(this.img);
                            this.viewer.refresh();
                        }).bind(this)
                    }).bind(this)

                    fileReader.onerror = () => {
                        console.error('Unable to read file ' + file.name + '.');
                    };

                    fileReader.readAsDataURL(files[0]);
                } else {
                console.error('Unsupported files or content dropped.');
                }
            }).bind(this)

        }
        
        // for development purposes
        //In case there is an image with name default.jpg open it
        init_default_img(){
                this.img = new Image();
                this.img.src = "./default.jpg";

                // successfully found a default image
                this.img.onload = (function(){
                
                    this.viewer.load_img(this.img);
                    this.viewer.refresh();
                }).bind(this)
                
                // No default image
                this.img.onerror = (function(){
                    return
                })

            }
        
    }

    
        const v = new viewer();
        new app(v);
})();