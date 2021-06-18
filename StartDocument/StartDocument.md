# Idea
For this assignment, Steffen has decided that he wants to make a game that integrates features 
from the games of the olden days, namely Tetris and Minesweeper. The following ideas are going 
to be developed into the web application: Minefields shaped as tetris blocks with random mine 
placements will drop, and depending on the user's placements, the display will update to indicate
how many mines are near the hidden blocks. each line of blocks will only disappear if the mines 
within are marked as flagged, and hidden blocks are opened.

i.e, the L and T shaped block from tetris would be represented by the following minefields (squares not to scale):

```
1  ■  1           1 1 2 1 1
1  ■  2  1        1 ■ ■ ■ 1
   ■  ■  1        1 1 ■ 1 1
   1  1  1             
             
1  x  1           1 1 2 1 1
1  ■  2  1        1 x ■ x 1
   ■  x  1        1 1 ■ 1 1
   1  1  1                          
 
 
 
```
As the game continues, the number of mines per minefield would increase, 
as well as the rate and speed at which the minefields drop.
The user should be able to save a block should they wish to hold it for a later time,
this functionality will allow users to hold out a difficult block for a later time.

For this assignment, the mootools library will be used as it provides various tools in handling
events, and making Object-Oriented Javascript more sane to create code. Additionally, the Phaser
framework will be used for rendering.

# Class Diagram 
![Class Diagram](Class%20Diagram.png)

# Application features

## Must Have
* A playing field where blocks are displayed
* Minefield containing a pre-determined number of mines and periodically drop down
* The ability to un-hide and flag/un-flag blocks
* Disappearing blocks when the x axis is filled
## Should Have
* The ability to rotate minefields
## Could Have
* A display of the next minefield which will drop
* A tally of the player's score as he/she plays along
* The ability for the player to save a minefield for later
## Willn't Have
* An increasing difficulty as the game goes on