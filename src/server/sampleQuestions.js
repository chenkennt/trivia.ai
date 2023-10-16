const sample = [
  {
    question: 'Which sport uses a shuttlecock?',
    choices: ['Tennis', 'Badminton', 'Table Tennis', 'Squash'],
    answer: 'Badminton'
  },
  {
    question: 'Who holds the record for most home runs in a single season in Major League Baseball?',
    choices: ['Babe Ruth', 'Barry Bonds', 'Mark McGwire', 'Sammy Sosa'],
    answer: 'Barry Bonds'
  },
  {
    question: 'What is the name of the professional basketball team in Los Angeles?',
    choices: ['Lakers', 'Clippers', 'Warriors', 'Spurs'],
    answer: 'Lakers'
  },
  {
    question: 'What is the name of the famous horse race held annually in Kentucky?',
    choices: [
      'Preakness Stakes',
      'Belmont Stakes',
      'Kentucky Derby',
      'Royal Ascot'
    ],
    answer: 'Kentucky Derby'
  },
  {
    question: 'What is the name of the highest mountain in the world?',
    choices: ['Kangchenjunga', 'Everest', 'K2', 'Makalu'],
    answer: 'Everest'
  },
  {
    question: 'What is the name of the world’s most famous cycling race?',
    choices: [
      'Tour de France',
      'Vuelta a España',
      "Giro d'Italia",
      'Milan-Sanremo'
    ],
    answer: 'Tour de France'
  },
  {
    question: 'What is the name of the famous tennis tournament held in Wimbledon, London?',
    choices: ['US Open', 'Australian Open', 'French Open', 'Wimbledon'],
    answer: 'Wimbledon'
  },
  {
    question: 'Which country is the reigning FIFA World Cup champion?',
    choices: ['Germany', 'France', 'Spain', 'Argentina'],
    answer: 'France'
  },
  {
    question: 'What is the name of the motor racing competition where drivers compete using custom-built cars?',
    choices: ['Formula One', 'NASCAR', 'IndyCar', 'Le Mans'],
    answer: 'Formula One'
  },
  {
    question: 'What is the name of the professional American football team based in New England?',
    choices: ['Patriots', 'Giants', 'Cowboys', 'Packers'],
    answer: 'Patriots'
  },
  {
    question: 'What is the name of the world’s most famous tennis player from Switzerland?',
    choices: [
      'Roger Federer',
      'Rafael Nadal',
      'Novak Djokovic',
      'Andy Murray'
    ],
    answer: 'Roger Federer'
  },
  {
    question: 'What is the name of the fast-paced ball game played on a court with five players on each team?',
    choices: ['Handball', 'Volleyball', 'Basketball', 'Soccer'],
    answer: 'Basketball'
  }
];

function generateQuestions() {
  return sample;
}

export { generateQuestions };