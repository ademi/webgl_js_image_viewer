"use strict";
//utils.init();
main();
function main(){
    let img = new Image();
    img.src = "./test.jpg";
    img.onload = (function(){
        renderer(img);
    })

let renderer = function render(img){

    const zoom_slider = document.getElementById("zoom_slider");
    const span =document.getElementById('display_factor');
    let zoom_factor = zoom_slider.value;
    zoom_slider.oninput=function(){
        zoom_factor = this.value;
        span.innerHTML = this.value;
        window.requestAnimationFrame(redraw);
    }

    let display = document.getElementById("glcanvas");
    let gl = display.getContext("webgl");

    if(!gl){
        console.error("web Gl is not supported");
        return;
    }

    /*Shaders*/
    let vertex_shader=`
    attribute vec2 a_position ;
    attribute vec2 a_tex_coord;

    uniform vec2 u_resolution;
    uniform float u_zoom_factor;

    varying vec2 v_tex_coord;
    
    void main(){
        vec2 clipspace = ((a_position/u_resolution) * 2.0)-1.0;
        gl_Position = vec4(clipspace.x*u_zoom_factor,clipspace.y*u_zoom_factor*-1.0,0,1);
        
        v_tex_coord = a_tex_coord;
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
    let program = utils.create_program (gl,
        {'VERTEX_SHADER':vertex_shader,
         'FRAGMENT_SHADER':frag_shader}
    );
    
    let position_handler = gl.getAttribLocation(program,'a_position');
    let texture_hadnler = gl.getAttribLocation(program,'a_tex_coord');
    let resolution_handler = gl.getUniformLocation(program,'u_resolution');
    let zooming_handler = gl.getUniformLocation(program,'u_zoom_factor');


    let position_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,position_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        0, 0,
        img.width, 0,
        0, img.height,
        0, img.height,
        img.width, 0,
        img.width, img.height,
    ]), gl.STATIC_DRAW);

    let texture_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,texture_buffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([
        0.0,0.0,
        1.0,0.0,
        0.0,1.0,

        0.0,1.0,
        1.0,0.0,
        1.0,1.0,
    ]),gl.STATIC_DRAW);

    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D,texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  
    // Upload the image into the texture.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    


    let redraw = function(){
        if(utils.resize_canvas(gl.canvas))
            gl.viewport(0,0,gl.canvas.width,gl.canvas.height);
        
    
        gl.useProgram(program);
    
        // Set Position info
        gl.enableVertexAttribArray(position_handler);
        gl.bindBuffer(gl.ARRAY_BUFFER,position_buffer);
        gl.vertexAttribPointer(
            position_handler, // the pointer
            2,                // coordinate size
            gl.FLOAT,         // Type
            false,            // Normalize
            0,                // Stride
            0,                //offset
        );

        // Set Texture info
        gl.enableVertexAttribArray(texture_hadnler);
        gl.bindBuffer(gl.ARRAY_BUFFER,texture_buffer);
        gl.vertexAttribPointer(
            texture_hadnler, // the pointer
            2,                // coordinate size
            gl.FLOAT,         // Type
            false,            // Normalize
            0,                // Stride
            0,                //offset
        );

        //Set Resolution
        gl.uniform2f(resolution_handler,gl.canvas.width,gl.canvas.height);
        // set zooming factor
        gl.uniform1f(zooming_handler,zoom_factor);
        //draw the Rectangle:
        gl.drawArrays(gl.TRIANGLES,0,6);
    }
    redraw()
}

}