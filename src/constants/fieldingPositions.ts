import type { FieldingPosition } from '../types/FieldingPosition';

export const FIELDING_POSITIONS: FieldingPosition[] = [
  // MANDATORY POSITIONS
  {
    id: "wicket_keeper",
    name: "Wicket-keeper",
    polar: { distance: 15, angle: 0 },
    type: "mandatory",
    side: "neutral",
    description: "Player behind the stumps who catches balls missed by batsman",
    common_situations: ["Always present"]
  },
  {
    id: "bowler",
    name: "Bowler",
    polar: { distance: 30, angle: 180 },
    type: "mandatory",
    side: "neutral",
    description: "The player who bowls the ball",
    common_situations: ["Always present"]
  },

  // SLIP CORDON (clockwise from keeper)
  {
    id: "first_slip",
    name: "First slip",
    polar: { distance: 15, angle: 350 },
    type: "variation",
    side: "off",
    description: "First in line in the slip cordon, closest to wicket-keeper",
    common_situations: ["Almost always used in longer formats", "Red ball cricket"]
  },
  {
    id: "second_slip",
    name: "Second slip",
    polar: { distance: 15, angle: 340 },
    type: "variation",
    side: "off",
    description: "Second in line in the slip cordon",
    common_situations: ["Standard attacking field", "Test cricket", "Fast bowling"]
  },
  {
    id: "third_slip",
    name: "Third slip",
    polar: { distance: 15, angle: 330 },
    type: "variation",
    side: "off",
    description: "Third in line in the slip cordon",
    common_situations: ["Attacking field", "Swinging conditions", "New ball"]
  },
  {
    id: "fourth_slip",
    name: "Fourth slip",
    polar: { distance: 15, angle: 320 },
    type: "variation",
    side: "off",
    description: "Fourth in line in the slip cordon",
    common_situations: ["Very attacking field", "Swinging conditions", "Early in innings"]
  },
  {
    id: "gully",
    name: "Gully",
    polar: { distance: 15, angle: 310 },
    type: "primary",
    side: "off",
    description: "Position in the slip cordon, angled toward point",
    common_situations: ["Test cricket", "Fast bowling", "Seaming conditions"]
  },

  // OFF SIDE POSITIONS (clockwise)
  {
    id: "third_man",
    name: "Third man",
    polar: { distance: 73, angle: 315 },
    type: "primary",
    side: "off",
    description: "Position behind the batsman on the off side, used to catch edges flying high and wide",
    common_situations: ["Fast bowling", "Bouncy pitches", "Aggressive batsmen"]
  },
  {
    id: "point",
    name: "Point",
    polar: { distance: 30, angle: 270 },
    type: "primary",
    side: "off",
    description: "Position square of the wicket on the off side",
    common_situations: ["Used in almost all formats", "Catching and stopping cuts"]
  },
  {
    id: "cover",
    name: "Cover",
    polar: { distance: 30, angle: 240 },
    type: "primary",
    side: "off",
    description: "Position in front of point on the off side",
    common_situations: ["Used in almost all formats", "To stop or catch cover drives"]
  },
  {
    id: "extra_cover",
    name: "Extra cover",
    polar: { distance: 30, angle: 225 },
    type: "variation",
    side: "off",
    description: "Position between cover and mid-off",
    common_situations: ["Medium to fast bowling", "To prevent drives"]
  },
  {
    id: "mid_off",
    name: "Mid-off",
    polar: { distance: 30, angle: 210 },
    type: "primary",
    side: "off",
    description: "Position straight down the pitch on the off side",
    common_situations: ["Used in almost all formats", "Straight driving batsmen"]
  },

  // ON (LEG) SIDE POSITIONS (continuing clockwise)
  {
    id: "mid_on",
    name: "Mid-on",
    polar: { distance: 30, angle: 150 },
    type: "primary",
    side: "leg",
    description: "Position straight down the pitch on the leg side",
    common_situations: ["Used in almost all formats", "Straight driving batsmen"]
  },
  {
    id: "mid_wicket",
    name: "Mid-wicket",
    polar: { distance: 30, angle: 120 },
    type: "primary",
    side: "leg",
    description: "Position on the leg side, in front of square leg",
    common_situations: ["Used in almost all formats", "For batsmen strong on the leg side"]
  },
  {
    id: "square_leg",
    name: "Square leg",
    polar: { distance: 45, angle: 90 },
    type: "primary",
    side: "leg",
    description: "Position square of the wicket on the leg side",
    common_situations: ["Used in almost all formats", "For catching leg glances and pull shots"]
  },
  {
    id: "fine_leg",
    name: "Fine leg",
    polar: { distance: 50, angle: 45 },
    type: "primary",
    side: "leg",
    description: "Position behind square on the leg side",
    common_situations: ["Used in almost all formats", "For catching leg glances"]
  },

  // CLOSE-IN POSITIONS
  {
    id: "silly_point",
    name: "Silly point",
    polar: { distance: 15, angle: 285 },
    type: "variation",
    side: "off",
    description: "Very close to the batsman at point angle",
    common_situations: ["Spin bowling", "Attacking field", "When batsman is hesitant against spin"]
  },

  // BOUNDARY POSITIONS (OFF SIDE)
  {
    id: "deep_third_man",
    name: "Deep third man",
    polar: { distance: 73, angle: 315 },
    type: "variation",
    side: "off",
    description: "Deeper version of third man, positioned closer to the boundary",
    common_situations: ["Defensive field setting", "When batsman is strong in cutting"]
  },
  {
    id: "deep_point",
    name: "Deep point",
    polar: { distance: 73, angle: 270 },
    type: "variation",
    side: "off",
    description: "Deep position square on the off side",
    common_situations: ["Limited overs cricket", "When batsman is strong square of the wicket"]
  },
  {
    id: "deep_cover",
    name: "Deep cover",
    polar: { distance: 73, angle: 240 },
    type: "variation",
    side: "off",
    description: "Deep position in the cover region",
    common_situations: ["Limited overs cricket", "When protection against cover drives is needed"]
  },
  {
    id: "deep_extra_cover",
    name: "Deep extra cover",
    polar: { distance: 73, angle: 225 },
    type: "variation",
    side: "off",
    description: "Deep position between cover and long-off",
    common_situations: ["Death overs", "When batsman is strong cover driver"]
  },
  {
    id: "long_off",
    name: "Long-off",
    polar: { distance: 73, angle: 210 },
    type: "variation",
    side: "off",
    description: "Deep position straight down the ground on the off side",
    common_situations: ["Death overs", "When batsman is strong straight driver"]
  },

  // BOUNDARY POSITIONS (LEG SIDE)
  {
    id: "long_on",
    name: "Long-on",
    polar: { distance: 73, angle: 150 },
    type: "variation",
    side: "leg",
    description: "Deep position straight down the ground on the leg side",
    common_situations: ["Death overs", "When batsman is strong straight hitter"]
  },
  {
    id: "deep_mid_wicket",
    name: "Deep mid-wicket",
    polar: { distance: 73, angle: 120 },
    type: "variation",
    side: "leg",
    description: "Deep position in the mid-wicket region",
    common_situations: ["Limited overs cricket", "When batsman is strong on the leg side"]
  },
  {
    id: "deep_square_leg",
    name: "Deep square leg",
    polar: { distance: 73, angle: 90 },
    type: "variation",
    side: "leg",
    description: "Deep position square on the leg side",
    common_situations: ["When batsman is strong puller/hooker", "Fast bowling"]
  },
  {
    id: "deep_fine_leg",
    name: "Deep fine leg",
    polar: { distance: 73, angle: 45 },
    type: "variation",
    side: "leg",
    description: "Deep position behind square on the leg side",
    common_situations: ["Death overs", "When protection against glances and fine shots is needed"]
  }
]; 