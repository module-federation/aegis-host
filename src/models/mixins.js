

const withId = (fnCreateId) => o => ({
  id: fnCreateId(),
  ...o,
});

const withTimestamp = (fnTimestamp) => o => ({
  created: fnTimestamp(),
  ...o,
});

const withCustomTimestamp = (fnTimestamp, customName) => o => ({
  [customName]: fnTimestamp(),
  ...o,
});

Object.assign(module.exports, {
  withId,
  withTimestamp,
  withCustomTimestamp
});








// const uuidv4 = () => 'ID123';
// const uuidv5 = () => 'ID133';
// const utcTime = () => new Date().toUTCString();


// const Model = ({ factory, args, name }) => {
//   const model = factory(args);
//   return {
//     name,
//     getName: () => name,
//     ...model
//   }
// };

// const withGender = gender => character => ({
//   gender,
//   ...character,
// });
// const isDwarf = character => ({
//   race: "Dwarf",
//   racialAbility: "Stone form",
//   ...character,
// });
// const isPriest = character => ({
//   class: "Priest",
//   abilities: ["Flash heal", "Resurrect"],
//   armourType: "Cloth",
//   ...character,
// });

// const factFunc = (val1) => {
//   return {
//     var1: val1,
//     validate: () => var1 ? true : false,
//   };
// }

// const makeModel = pipe(
//   Model,
//   isDwarf,
//   isPriest,
//   withGender("Male"),
// );

// model = makeModel({ factory: factFunc, args: 'arg', name: 'model1' });

// console.log(model);








// const Model = ({ factory, args, name }) => {
//   const model = factory(args);
//   return {
//     name,
//     getName: () => name,
//     ...model
//   }
// };

// const withGender = gender => character => ({
//   gender,
//   ...character,
// });
// const isDwarf = character => ({
//   race: "Dwarf",
//   racialAbility: "Stone form",
//   ...character,
// });
// const isPriest = character => ({
//   class: "Priest",
//   abilities: ["Flash heal", "Resurrect"],
//   armourType: "Cloth",
//   ...character,
// });

// const factFunc = (val1) => {
//   return {
//     var1: val1,
//     validate: () => var1 ? true : false,
//   };
// }

// const makeModel = pipe(
//   Model,
//   isDwarf,
//   isPriest,
//   withGender("Male"),
// );

// model = makeModel({ factory: factFunc, args: 'arg', name: 'model1' });

// console.log(model);