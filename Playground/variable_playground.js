// var person ={
//   name:"Andrew",
//   age:21
// };
//
// function updatePerson(obj){
//   obj.age=24;
// }
// updatePerson(person);
// console.log(person);

var array = [16,27];
function pushNewValue(arr){
  arr.push(82);
}
function changeValue(arr){
  array = [16,32];
  arr =array;
}

pushNewValue(array);
console.log(array);

changeValue(array);

console.log(array);
