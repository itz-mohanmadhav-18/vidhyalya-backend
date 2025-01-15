const students = [
    { id: "1", name: "John Doe", age: 15, class: "10th" },
    { id: "2", name: "Jane Smith", age: 14, class: "9th" },
  ];
  
  const resolvers = {
    Query: {
      students: () => students,
      student: (_, { id }) => students.find(student => student.id === id),
    },
    Mutation: {
      addStudent: (_, { name, age, class: studentClass }) => {
        const newStudent = {
          id: String(students.length + 1),
          name,
          age,
          class: studentClass,
        };
        students.push(newStudent);
        return newStudent;
      },
      updateStudent: (_, { id, name, age, class: studentClass }) => {
        const student = students.find(student => student.id === id);
        if (!student) return null;
  
        if (name !== undefined) student.name = name;
        if (age !== undefined) student.age = age;
        if (studentClass !== undefined) student.class = studentClass;
  
        return student;
      },
      deleteStudent: (_, { id }) => {
        const index = students.findIndex(student => student.id === id);
        if (index === -1) return "Student not found";
  
        students.splice(index, 1);
        return `Student with ID ${id} deleted`;
      },
    },
  };
  
  module.exports = resolvers;
  