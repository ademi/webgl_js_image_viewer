(function(){
    
    
    window.utils = {};
    utils.init = function(){
        window.console.log("logging");
    }
/*
* Constants
*/
    const defaultShaderType = [
        'VERTEX_SHADER',
        'FRAGMENT_SHADER',
    ];
/*
*   Methods
*/
    // Creates Program, Attaches Sahders
    utils.create_program = function(
        gl,                 // web gl context.
        shaders_src,         // object of shaders and their type
        opt_error_callback  // Error function to call in case of error (optional)
    )
    {
        const errFn = opt_error_callback||log_error;
        
        const shaders=[]
        for (const [type, src] of Object.entries(shaders_src)) {
            shaders.push(this.load_shader(
                gl,src,type,errFn
            ));
        }
        
        const program = gl.createProgram();
        shaders.forEach(function(shader){
            gl.attachShader(program,shader);
        });
        gl.linkProgram(program);

        const linked = gl.getProgramParameter(program,gl.LINK_STATUS);
        if(!linked){
            const err_msg = gl.getProgramInfoLog(program);
            errFn('Error In Program Linking:'+err_msg);
            gl.deleteProgram(program);
            return null;
        }
        return program;
    }
    /**
     * Loads Shaders into a gl context
     */
    utils.load_shader =function(
        gl,             //webGl Context
        shaderSrc,     // Shaders source as string
        shaderType,     //shader Type
        opt_errFn       // Error Call back (optional)
    )
    {
        const errFn = opt_errFn||log_error;
        let type;
        if(shaderType == 'VERTEX_SHADER')type = gl.VERTEX_SHADER;
        else if (shaderType = 'FRAGMENT_SHADER')type = gl.FRAGMENT_SHADER;
        else{
            throw ("Uknown Shader Type");
        }

        const shader = gl.createShader(type);

        gl.shaderSource(shader,shaderSrc);
        gl.compileShader(shader);

        const compiled = gl.getShaderParameter(shader,gl.COMPILE_STATUS);
        if(!compiled){
            const err_msg = gl.getShaderInfoLog(shader);
            errFn('Error While Compiling Shader of type: \''+shader+'\':'+err_msg)
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    // Resizing canvas drawing buffer to the canvas css dimensions
    // inputs:
    //  The canvas to be resized
    //  Multiplier: could be the ratio between the css pixels and the
    //              actual drawing pixels. In devices with higher definition
    //              ratio these ratio could be bigger than 1;
    //              call window.devicePixelRatio to get the ratio
    // returns true if canvas was resized
    utils.resize_canvas = function (canvas,ratio){
        let multiplier = ratio||1;

        new_width = canvas.clientWidth* multiplier |0;
        new_height= canvas.clientHeight * multiplier |0;

        if(canvas.width !=new_width || canvas.height != new_height){
            canvas.width =new_width;
            canvas.height = new_height;
            return true;
        }
        return false;
    }
    // Error Wrapper 
    // logs error message to console
    function log_error(msg){
        if(window.console){
            if(window.console.error){
                window.console.error(msg);
            }
            else if (window.console.log){
                window.console.log(msg);
            }
        }
    }

}(window||this))