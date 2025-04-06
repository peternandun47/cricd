import type { FieldingPosition } from '../types/FieldingPosition';

export const FIELDING_POSITIONS: FieldingPosition[] = [
  // MANDATORY POSITIONS
  {
    id: "wicket_keeper",
    name: "Wicket-keeper",
    polar: { 
      distance: { min: 10, max: 20, preferred: 15 },
      angle: { min: 355, max: 5, preferred: 0 }
    },
    type: "mandatory",
    side: "neutral",
    description: "Player behind the stumps who catches balls missed by batsman",
    common_situations: ["Always present"]
  },
  {
    id: "bowler",
    name: "Bowler",
    polar: { 
      distance: { min: 25, max: 35, preferred: 30 },
      angle: { min: 175, max: 185, preferred: 180 }
    },
    type: "mandatory",
    side: "neutral",
    description: "The player who bowls the ball",
    common_situations: ["Always present"]
  },
  {
    id: "flyslip",
    name: "Flyslip",
    polar: { 
      distance: { min: 60, max: 75, preferred: 65 },
      angle: { min: 350, max: 359, preferred: 355 }
    },
    type: "variation",
    side: "neutral",
    description: "The player who is at flyslip position",
    common_situations: ["rarely used"]
  },
  

  // SLIP CORDON (clockwise from keeper)
  {
    id: "first_slip",
    name: "First slip",
    polar: { 
      distance: { min: 15, max: 25, preferred: 15 },
      angle: { min: 345, max: 355, preferred: 350 }
    },
    type: "variation",
    side: "off",
    description: "First in line in the slip cordon, closest to wicket-keeper",
    common_situations: ["Almost always used in longer formats", "Red ball cricket"]
  },
  {
    id: "second_slip",
    name: "Second slip",
    polar: { 
      distance: { min: 15, max: 25, preferred: 15 },
      angle: { min: 335, max: 345, preferred: 340 }
    },
    type: "variation",
    side: "off",
    description: "Second in line in the slip cordon",
    common_situations: ["Standard attacking field", "Test cricket", "Fast bowling"]
  },
  {
    id: "third_slip",
    name: "Third slip",
    polar: { 
      distance: { min: 15, max: 25, preferred: 15 },
      angle: { min: 325, max: 335, preferred: 330 }
    },
    type: "variation",
    side: "off",
    description: "Third in line in the slip cordon",
    common_situations: ["Attacking field", "Swinging conditions", "New ball"]
  },
  {
    id: "fourth_slip",
    name: "Fourth slip",
    polar: { 
      distance: { min: 15, max: 25, preferred: 15 },
      angle: { min: 315, max: 325, preferred: 320 }
    },
    type: "variation",
    side: "off",
    description: "Fourth in line in the slip cordon",
    common_situations: ["Very attacking field", "Swinging conditions", "Early in innings"]
  },
  {
    id: "gully",
    name: "Gully",
    polar: { 
      distance: { min: 15, max: 20, preferred: 15 },
      angle: { min: 305, max: 315, preferred: 310 }
    },
    type: "primary",
    side: "off",
    description: "Position in the slip cordon, angled toward point",
    common_situations: ["Test cricket", "Fast bowling", "Seaming conditions"]
  },

  // OFF SIDE POSITIONS (clockwise)
  {
    id: "third_man",
    name: "Third man",
    polar: { 
      distance: { min: 60, max: 78, preferred: 73 },
      angle: { min: 300, max: 350, preferred: 315 }
    },
    type: "primary",
    side: "off",
    description: "Position behind the batsman on the off side, used to catch edges flying high and wide",
    common_situations: ["Fast bowling", "Bouncy pitches", "Aggressive batsmen"]
  },
  {
    id: "point",
    name: "Point",
    polar: { 
      distance: { min: 21, max: 35, preferred: 30 },
      angle: { min: 275, max: 305, preferred: 270 }
    },
    type: "primary",
    side: "off",
    description: "Position square of the wicket on the off side",
    common_situations: ["Used in almost all formats", "Catching and stopping cuts"]
  },
  {
    id: "cover",
    name: "Cover",
    polar: { 
      distance: { min: 25, max: 35, preferred: 30 },
      angle: { min: 235, max: 245, preferred: 240 }
    },
    type: "primary",
    side: "off",
    description: "Position in front of point on the off side",
    common_situations: ["Used in almost all formats", "To stop or catch cover drives"]
  },
  {
    id: "extra_cover",
    name: "Extra cover",
    polar: { 
      distance: { min: 25, max: 35, preferred: 30 },
      angle: { min: 220, max: 230, preferred: 225 }
    },
    type: "variation",
    side: "off",
    description: "Position between cover and mid-off",
    common_situations: ["Medium to fast bowling", "To prevent drives"]
  },
  {
    id: "mid_off",
    name: "Mid-off",
    polar: { 
      distance: { min: 25, max: 35, preferred: 30 },
      angle: { min: 205, max: 215, preferred: 210 }
    },
    type: "primary",
    side: "off",
    description: "Position straight down the pitch on the off side",
    common_situations: ["Used in almost all formats", "Straight driving batsmen"]
  },

  // ON (LEG) SIDE POSITIONS (continuing clockwise)
  {
    id: "mid_on",
    name: "Mid-on",
    polar: { 
      distance: { min: 25, max: 35, preferred: 30 },
      angle: { min: 145, max: 155, preferred: 150 }
    },
    type: "primary",
    side: "leg",
    description: "Position straight down the pitch on the leg side",
    common_situations: ["Used in almost all formats", "Straight driving batsmen"]
  },
  {
    id: "mid_wicket",
    name: "Mid-wicket",
    polar: { 
      distance: { min: 25, max: 35, preferred: 30 },
      angle: { min: 115, max: 125, preferred: 120 }
    },
    type: "primary",
    side: "leg",
    description: "Position on the leg side, in front of square leg",
    common_situations: ["Used in almost all formats", "For batsmen strong on the leg side"]
  },
  {
    id: "square_leg",
    name: "Square leg",
    polar: { 
      distance: { min: 40, max: 50, preferred: 45 },
      angle: { min: 85, max: 95, preferred: 90 }
    },
    type: "primary",
    side: "leg",
    description: "Position square of the wicket on the leg side",
    common_situations: ["Used in almost all formats", "For catching leg glances and pull shots"]
  },
  {
    id: "fine_leg",
    name: "Fine leg",
    polar: { 
      distance: { min: 45, max: 55, preferred: 50 },
      angle: { min: 40, max: 50, preferred: 45 }
    },
    type: "primary",
    side: "leg",
    description: "Position behind square on the leg side",
    common_situations: ["Used in almost all formats", "For catching leg glances"]
  },

  // CLOSE-IN POSITIONS
  {
    id: "silly_point",
    name: "Silly point",
    polar: { 
      distance: { min: 10, max: 20, preferred: 15 },
      angle: { min: 280, max: 290, preferred: 285 }
    },
    type: "variation",
    side: "off",
    description: "Very close to the batsman at point angle",
    common_situations: ["Spin bowling", "Attacking field", "When batsman is hesitant against spin"]
  },

  // BOUNDARY POSITIONS (OFF SIDE)
  {
    id: "deep_third_man",
    name: "Deep third man",
    polar: { 
      distance: { min: 68, max: 78, preferred: 73 },
      angle: { min: 310, max: 320, preferred: 315 }
    },
    type: "variation",
    side: "off",
    description: "Deeper version of third man, positioned closer to the boundary",
    common_situations: ["Defensive field setting", "When batsman is strong in cutting"]
  },
  {
    id: "deep_point",
    name: "Deep point",
    polar: { 
      distance: { min: 68, max: 78, preferred: 73 },
      angle: { min: 265, max: 275, preferred: 270 }
    },
    type: "variation",
    side: "off",
    description: "Deep position square on the off side",
    common_situations: ["Limited overs cricket", "When batsman is strong square of the wicket"]
  },
  {
    id: "deep_cover",
    name: "Deep cover",
    polar: { 
      distance: { min: 68, max: 78, preferred: 73 },
      angle: { min: 235, max: 245, preferred: 240 }
    },
    type: "variation",
    side: "off",
    description: "Deep position in the cover region",
    common_situations: ["Limited overs cricket", "When protection against cover drives is needed"]
  },
  {
    id: "deep_extra_cover",
    name: "Deep extra cover",
    polar: { 
      distance: { min: 68, max: 78, preferred: 73 },
      angle: { min: 220, max: 230, preferred: 225 }
    },
    type: "variation",
    side: "off",
    description: "Deep position between cover and long-off",
    common_situations: ["Death overs", "When batsman is strong cover driver"]
  },
  {
    id: "long_off",
    name: "Long-off",
    polar: { 
      distance: { min: 68, max: 78, preferred: 73 },
      angle: { min: 205, max: 215, preferred: 210 }
    },
    type: "variation",
    side: "off",
    description: "Deep position straight down the ground on the off side",
    common_situations: ["Death overs", "When batsman is strong straight driver"]
  },

  // BOUNDARY POSITIONS (LEG SIDE)
  {
    id: "long_on",
    name: "Long-on",
    polar: { 
      distance: { min: 68, max: 78, preferred: 73 },
      angle: { min: 145, max: 155, preferred: 150 }
    },
    type: "variation",
    side: "leg",
    description: "Deep position straight down the ground on the leg side",
    common_situations: ["Death overs", "When batsman is strong straight hitter"]
  },
  {
    id: "deep_mid_wicket",
    name: "Deep mid-wicket",
    polar: { 
      distance: { min: 68, max: 78, preferred: 73 },
      angle: { min: 115, max: 125, preferred: 120 }
    },
    type: "variation",
    side: "leg",
    description: "Deep position in the mid-wicket region",
    common_situations: ["Limited overs cricket", "When batsman is strong on the leg side"]
  },
  {
    id: "deep_square_leg",
    name: "Deep square leg",
    polar: { 
      distance: { min: 68, max: 78, preferred: 73 },
      angle: { min: 85, max: 95, preferred: 90 }
    },
    type: "variation",
    side: "leg",
    description: "Deep position square on the leg side",
    common_situations: ["When batsman is strong puller/hooker", "Fast bowling"]
  },
  {
    id: "deep_fine_leg",
    name: "Deep fine leg",
    polar: { 
      distance: { min: 60, max: 78, preferred: 73 },
      angle: { min: 5, max: 40, preferred: 30 }
    },
    type: "variation",
    side: "leg",
    description: "Deep position behind square on the leg side",
    common_situations: ["Death overs", "When protection against glances and fine shots is needed"]
  }
]; 