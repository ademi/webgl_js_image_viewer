class viewer{
        init(canvas){
            this.canvas = canvas;
        }
        load_img(img){
            this.img =img;

            this.gl = this.canvas.getContext("webgl");
    
            if(!this.gl){
                return;
            }
            
            /*Shaders*/
            let vertex_shader=`
            attribute vec2 a_position ;

            uniform vec2 u_displacement;
            uniform float u_aspect;
            uniform float u_zoom_factor;
            
            varying vec2 v_tex_coord;
    
            void main(){
                vec2 _position = a_position;//  + u_displacement;
                gl_Position = vec4(
                        _position.x*u_zoom_factor +u_displacement.x,
                        (_position.y*u_zoom_factor*u_aspect - u_displacement.y),
                        0.0,1.0);
        
                v_tex_coord = vec2((_position.x+1.0)/2.0,(1.0-_position.y)/2.0);
            }
            `
            let frag_shader=
            `precision mediump float;

            // our texture
            uniform sampler2D u_image;

            // the texCoords passed in from the vertex shader.
            varying vec2  v_tex_coord;

            void main() {
            gl_FragColor = texture2D(u_image, v_tex_coord);
            }
            `
            this.program = utils.create_program (this.gl,
                {'VERTEX_SHADER':vertex_shader,
                'FRAGMENT_SHADER':frag_shader}
            );
    
            this.position_handler = this.gl.getAttribLocation(this.program,'a_position');
            //this.texture_hadnler = this.gl.getAttribLocation(this.program,'a_tex_coord');

            this.displacement_handler = this.gl.getUniformLocation(this.program,'u_displacement');
            this.aspect_handler = this.gl.getUniformLocation(this.program,'u_aspect');
            this.zooming_handler = this.gl.getUniformLocation(this.program,'u_zoom_factor');


            this.position_buffer = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.position_buffer);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([
                -1.0,   -1.0 ,
                1.0,    -1.0 ,
                -1.0,    1.0 ,

                -1.0,    1.0 ,
                1.0,    -1.0 ,
                1.0,    1.0 ,
            ]), this.gl.STATIC_DRAW);


            let texture = this.gl.createTexture();
            this.gl.bindTexture(this.gl.TEXTURE_2D,texture);

            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
  
            // Upload the image into the texture.
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.img);
            
            //initiate displacement configureations to defaults
            this.config ={
                delta_x :0.0,
                delta_y :0.0,
                zoom    :1.0,
            }
            
            
        }
        reset_placement(){
            this.config ={
                delta_x :0.0,
                delta_y :0.0,
                zoom    :1.0,
            }
        }
        update_placement(config){
            //fill up all unspecified configs previous config
            let concrete_config=null;
            
            if(config)
                concrete_config ={
                    delta_x: config.delta_x ||this.config.delta_x,
                    delta_y: config.delta_y ||this.config.delta_y,
                    zoom:    config.zoom    ||this.config.zoom,
                }
            else
                return;


            this.config = {
                delta_x :   Math.max(-1.0,Math.min(1.0,this.config.delta_x +(concrete_config.delta_x/this.gl.canvas.width) )),
                delta_y :   Math.max(-1.0,Math.min(1.0,this.config.delta_y +(concrete_config.delta_y/this.gl.canvas.height) )),
                zoom    :   Math.max(0.0,Math.min(2.0,concrete_config.zoom || this.config.zoom)),
            }

        }
        refresh (config){
            
            if(utils.resize_canvas(this.gl.canvas)){
                this.gl.viewport(0,0,this.gl.canvas.width,this.gl.canvas.height);
                //reset configuration
                this.reset_placement();
            }
            
            this.update_placement(config);
            
            this.gl.useProgram(this.program);
    
            // Set Position info
            this.gl.enableVertexAttribArray(this.position_handler);
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.position_buffer);
            this.gl.vertexAttribPointer(
                this.position_handler, // the pointer
                2,                // coordinate size
                this.gl.FLOAT,         // Type
                false,            // Normalize
                0,                // Stride
                0,                //offset
            );


            
            //Set aspect
            const aspect = (this.img.height/this.img.width)*(this.canvas.width/this.canvas.height)
            this.gl.uniform1f(this.aspect_handler, aspect);
            // set zooming factor
            this.gl.uniform1f(this.zooming_handler,this.config.zoom);
            // set up displacement
            this.gl.uniform2f(this.displacement_handler,this.config.delta_x,this.config.delta_y)
            //draw the Rectanthis.gle:
            this.gl.drawArrays(this.gl.TRIANGLES,0,6);
            
        }
    }