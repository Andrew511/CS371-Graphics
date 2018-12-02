                                                       // PoVRay 3.7 Scene File " ... .pov"
// author:  ...
// date:    ...
//--------------------------------------------------------------------------
#version 3.7;
global_settings{ assumed_gamma 1.0 }
#default{ finish{ ambient 0.1 diffuse 0.9 }} 
//--------------------------------------------------------------------------
#include "colors.inc"
#include "textures.inc"
#include "glass.inc"
#include "metals.inc"
#include "golds.inc"
#include "stones.inc"
#include "woods.inc"
#include "shapes.inc"
#include "shapes2.inc"
#include "functions.inc"
#include "math.inc"
#include "transforms.inc"   
#include "shapes3.inc"      
#include "particle.inc"
#include "trashcan.inc"



   #declare ShowCloud  = no;
   #declare ShowSmoke  = no;
   #declare ShowDust   = no;
   #declare ShowDebris = no;  
   
   
   
   #declare particle_start  = 0.3;
    #declare particle_end    = 1.0;
    #declare particle_cyclic = off;
    #declare particle_steps  = 100;
    
    // General particle settings
// *************************
   
   #declare particle_frequency = 250;
   #declare particle_life      = 0.6;
   #declare particle_lifeturb  = 0.3;
   #declare particle_seed      = 123;
   //#declare particle_maxnumber = 100; 
// Emitter settings
// ****************
   
   #macro particle_emitter  (Clock) <-0.2,-1.0 ,0.0 > #end
   #macro particle_emitting (Clock) (Clock < 0.5)   #end
   #macro particle_emitvect (Clock) <1,1,1> #end
   #macro particle_emitturb (Clock) 3.0     #end
   //#macro particle_emitobj  (Clock) object {} #end
   #macro particle_emitobjn (Clock) 0.0     #end

   
                                

//--------------------------------------------------------------------------
// camera ------------------------------------------------------------------
#declare camera_location = <0.0 , 0.5 ,-10.0>;

   camera {
      location camera_location
      angle    12
      look_at  <0.0,-0.5,0.0>
   }
// sun ---------------------------------------------------------------------
light_source{<1500,2500,-2500> color White}                     

// ground ------------------------------------------------------------------
plane{ <0,1,0>, -1.25 
       pigment {
            brick pigment{Yellow}, pigment{LightGray}
            }
     }
     
// Sky ------------------------------------------------------------------
plane{ <0,-1,0>, -2501
       pigment {
            LightBlue
            }
     }
             
             
// Objects                        
#declare Ball = sphere {
    <-0.5, -1.0, 0.0>, 0.25
        texture{ pigment{ color rgb<0 ,.8,0.8, 0.9>} 
                     finish { subsurface {translucency Green}}
                   }  
    }
#declare Ring = torus {
        .25, .125
        texture { 
            pigment {
                 Blue
            }
            finish { reflection {1.0} ambient 0 diffuse 0.3 }
        }
        translate <0,-1.1,1.5>
        
}
#declare TCone = cone {
    <1, -1.25, -3.5>, 0.5    // Center and radius of one end
    <1, 2, -3.5>, 0.1    // Center and radius of other end
    texture { 
                pigment {
                 Orange
            }
            finish { phong 1.0 }
            }
  }
#if (clock < .4) 
object { Ball 
        translate <1 * clock, 0, 0>     
             
      }
#else 
    object { Ball 
        translate <0, -100, 0>     
             }


#end
object {Ring}
object {
        trashcan         
        scale .5
        rotate <0,180,0>
        translate <-1,0,0>
        rotate <0,0,200 * clock> 
        texture { 
            pigment {
                 Blue
            }
            finish { reflection {1.0} ambient 0.2 diffuse 0.3 }
        } 
        
        }  
object {TCone}           

    

#include "glow.inc"


   #declare glow_color     = <0.0,0.8,0.8>;
   #declare glow_colorturb = <0.3,0.3,0.3>;
   #declare glow_size      = 0.1;
   #declare glow_samples   = 1;  
   
   #macro particle_element ()
//    Do things with the particle data here. Available data:
//    p_id,        p_random,    p_location,  p_direction, p_life,
//    p_age,       p_birth,     p_state,     p_rotate
      glow_element()
   #end 
   
   
particle_system ("glitter2")   
