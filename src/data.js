export const SAMPLE_BOARDS = [
  { id: 'b1', name: 'Подкаст Lex Fridman', total: 24, due: 8,  done: 16, color: '#d4f564' },
  { id: 'b2', name: 'Бизнес-английский',   total: 56, due: 3,  done: 53, color: '#5b8def' },
  { id: 'b3', name: 'Сериал Severance',    total: 18, due: 12, done: 6,  color: '#ff9f43' },
  { id: 'b4', name: 'IT и продукт',        total: 41, due: 0,  done: 41, color: '#3a3a3a' },
];

export const SAMPLE_CARDS = [
  { id: 'c1',  type: 'word',   word: 'ambiguous',   definition: 'open to more than one interpretation; not having one obvious meaning', translation: 'двусмысленный',      example: 'His answer was ambiguous and left everyone confused.',    level: 'learning' },
  { id: 'c2',  type: 'word',   word: 'serendipity', definition: 'the occurrence of events by chance in a happy or beneficial way',      translation: 'счастливая случайность', example: 'Meeting her at the bookstore was pure serendipity.',     level: 'new'      },
  { id: 'c3',  type: 'word',   word: 'ephemeral',   definition: 'lasting for a very short time',                                        translation: 'мимолётный',          example: 'The beauty of cherry blossoms is ephemeral.',            level: 'know'     },
  { id: 'c4',  type: 'word',   word: 'ubiquitous',  definition: 'present, appearing, or found everywhere',                              translation: 'вездесущий',          example: 'Smartphones have become ubiquitous in modern life.',     level: 'master'   },
  { id: 'c5',  type: 'word',   word: 'cogent',      definition: 'clear, logical, and convincing',                                       translation: 'убедительный',        example: 'She made a cogent argument for the new policy.',         level: 'learning' },
  { id: 'c6',  type: 'word',   word: 'pragmatic',   definition: 'dealing with things sensibly and realistically',                       translation: 'прагматичный',        example: 'We need a pragmatic approach to this problem.',          level: 'know'     },
  { id: 'c7',  type: 'word',   word: 'esoteric',    definition: 'intended for or understood by only a small number of people',          translation: 'эзотерический',       example: 'His esoteric humor went over most heads.',               level: 'new'      },
  { id: 'c8',  type: 'word',   word: 'verbose',     definition: 'using or expressed in more words than are needed',                     translation: 'многословный',        example: 'The report was verbose and could be cut in half.',       level: 'learning' },
  { id: 'c9',  type: 'word',   word: 'pertinent',   definition: 'relevant or applicable to a particular matter',                        translation: 'уместный',            example: 'Please keep your questions pertinent to the topic.',     level: 'know'     },
  { id: 'c10', type: 'word',   word: 'lucid',       definition: 'expressed clearly; easy to understand',                                translation: 'ясный',               example: 'She gave a lucid explanation of the theory.',            level: 'master'   },
  { id: 'c11', type: 'word',   word: 'meticulous',  definition: 'showing great attention to detail; very careful',                      translation: 'дотошный',            example: 'He kept meticulous notes during every meeting.',         level: 'learning' },
  { id: 'c12', type: 'word',   word: 'redundant',   definition: 'no longer needed or useful; superfluous',                              translation: 'избыточный',          example: 'This sentence has redundant information.',               level: 'new'      },
  { id: 'p1',  type: 'phrase', word: 'on the fence',          definition: 'undecided between two options',                              translation: 'не определился',      example: "I'm still on the fence about taking the job.",          level: 'learning' },
  { id: 'p2',  type: 'phrase', word: 'cut corners',           definition: 'do something in the easiest, cheapest way',                  translation: 'халтурить',           example: "Don't cut corners on safety equipment.",                level: 'know'     },
  { id: 'p3',  type: 'phrase', word: 'spill the beans',       definition: 'reveal a secret',                                           translation: 'выболтать секрет',    example: "Don't spill the beans about the surprise party.",       level: 'new'      },
  { id: 'p4',  type: 'phrase', word: 'bite the bullet',       definition: 'decide to do something difficult or unpleasant',             translation: 'стиснуть зубы',       example: 'I had to bite the bullet and call my dentist.',         level: 'know'     },
  { id: 'p5',  type: 'phrase', word: 'piece of cake',         definition: 'something very easy',                                       translation: 'проще простого',      example: 'The exam was a piece of cake.',                         level: 'master'   },
  { id: 'p6',  type: 'phrase', word: 'break the ice',         definition: 'start a conversation in a friendly way',                    translation: 'разрядить обстановку', example: 'He told a joke to break the ice.',                     level: 'learning' },
  { id: 'p7',  type: 'phrase', word: 'hit the nail on the head', definition: 'describe exactly what is causing a situation',           translation: 'попасть в точку',     example: 'You hit the nail on the head with that comment.',       level: 'know'     },
  { id: 'p8',  type: 'phrase', word: 'under the weather',     definition: 'feeling slightly ill',                                      translation: 'нездоровится',        example: "I'm feeling a bit under the weather today.",            level: 'new'      },
];

export const SAMPLE_DRAFT = [
  { word: 'languish',  definition: 'fail to develop, progress, or succeed' },
  { word: 'epitome',   definition: 'a person or thing that is a perfect example of a quality' },
  { word: 'galvanize', definition: 'shock or excite into action' },
  { word: 'obfuscate', definition: 'make something unclear or hard to understand' },
];

export const SAMPLE_DAYS30 = [3,5,8,2,0,12,7,4,9,6,11,5,8,3,0,7,10,4,6,8,12,5,9,7,11,4,8,6,9,12];

export const SAMPLE_WEAK = [
  { word: 'idiosyncratic', misses: 7 },
  { word: 'perfunctory',   misses: 5 },
  { word: 'ambiguous',     misses: 4 },
  { word: 'capitulate',    misses: 3 },
  { word: 'recalcitrant',  misses: 3 },
];

export const SAMPLE_LEVELS = [
  { id: 'new',      label: 'Учу',     count: 18 },
  { id: 'learning', label: 'Знакомо', count: 42 },
  { id: 'know',     label: 'Знаю',    count: 58 },
  { id: 'master',   label: 'Владею',  count: 21 },
];
