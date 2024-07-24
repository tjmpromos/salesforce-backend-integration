const req = {
  body: "Body",
  another: {
    name: "name",
    anotherName: "another name",
  },
};

const {
  another: { name, anotherName },
} = req;
console.log(anotherName);
