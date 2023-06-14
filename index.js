// Import necessary packages and modules
const { prompt } = require("inquirer");
const logo = require("asciiart-logo");
const db = require("./db");

// Initialize the program
init();

function init() {
  console.log("   |-Employee Manager-|");
  // Load the main prompts
  loadMainPrompts();
}

function loadMainPrompts() {
  // Prompt the user with a list of options
  prompt([
    {
      type: "list",
      name: "choice",
      message: "What would you like to do?",
      choices: [
        // Available options for the user
        { name: "View All Employees", value: "VIEW_EMPLOYEES" },
        { name: "View All Employees By Department", value: "VIEW_EMPLOYEES_BY_DEPARTMENT" },
        { name: "View All Employees By Manager", value: "VIEW_EMPLOYEES_BY_MANAGER" },
        { name: "Add Employee", value: "ADD_EMPLOYEE" },
        { name: "Remove Employee", value: "REMOVE_EMPLOYEE" },
        { name: "Update Employee Role", value: "UPDATE_EMPLOYEE_ROLE" },
        { name: "Update Employee Manager", value: "UPDATE_EMPLOYEE_MANAGER" },
        { name: "View All Roles", value: "VIEW_ROLES" },
        { name: "Add Role", value: "ADD_ROLE" },
        { name: "Remove Role", value: "REMOVE_ROLE" },
        { name: "View All Departments", value: "VIEW_DEPARTMENTS" },
        { name: "Add Department", value: "ADD_DEPARTMENT" },
        { name: "Remove Department", value: "REMOVE_DEPARTMENT" },
        { name: "View Total Utilized Budget By Department", value: "VIEW_UTILIZED_BUDGET_BY_DEPARTMENT" },
        { name: "Quit", value: "QUIT" }
      ]
    }
  ]).then(handleChoice);
}

function handleChoice(res) {
  const choice = res.choice;

  switch (choice) {
    // Call the appropriate function based on the user's choice
    case "VIEW_EMPLOYEES":
      viewEmployees();
      break;
    case "VIEW_EMPLOYEES_BY_DEPARTMENT":
      viewEmployeesByDepartment();
      break;
    case "VIEW_EMPLOYEES_BY_MANAGER":
      viewEmployeesByManager();
      break;
    case "ADD_EMPLOYEE":
      addEmployee();
      break;
    case "REMOVE_EMPLOYEE":
      removeEmployee();
      break;
    case "UPDATE_EMPLOYEE_ROLE":
      updateEmployeeRole();
      break;
    case "UPDATE_EMPLOYEE_MANAGER":
      updateEmployeeManager();
      break;
    case "VIEW_DEPARTMENTS":
      viewDepartments();
      break;
    case "ADD_DEPARTMENT":
      addDepartment();
      break;
    case "REMOVE_DEPARTMENT":
      removeDepartment();
      break;
    case "VIEW_UTILIZED_BUDGET_BY_DEPARTMENT":
      viewUtilizedBudgetByDepartment();
      break;
    case "VIEW_ROLES":
      viewRoles();
      break;
    case "ADD_ROLE":
      addRole();
      break;
    case "REMOVE_ROLE":
      removeRole();
      break;
    default:
      quit();
  }
}

// Function to view all employees
function viewEmployees() {
  db.findAllEmployees()
    .then(([rows]) => {
      const employees = rows;
      console.log("\n");
      console.table(employees);
    })
    .then(loadMainPrompts);
}

// Function to view employees by department
function viewEmployeesByDepartment() {
  db.findAllDepartments()
    .then(([rows]) => {
      const departments = rows;
      const departmentChoices = departments.map(({ id, name }) => ({
        name: name,
        value: id
      }));

      prompt([
        {
          type: "list",
          name: "departmentId",
          message: "Choose a department:",
          choices: departmentChoices
        }
      ])
        .then(res => db.findAllEmployeesByDepartment(res.departmentId))
        .then(([rows]) => {
          const employees = rows;
          console.log("\n");
          console.table(employees);
        })
        .then(loadMainPrompts);
    });
}

// Function to view employees by manager
function viewEmployeesByManager() {
  db.findAllEmployees()
    .then(([rows]) => {
      const managers = rows;
      const managerChoices = managers.map(({ id, first_name, last_name }) => ({
        name: `${first_name} ${last_name}`,
        value: id
      }));

      prompt([
        {
          type: "list",
          name: "managerId",
          message: "Choose a manager:",
          choices: managerChoices
        }
      ])
        .then(res => db.findAllEmployeesByManager(res.managerId))
        .then(([rows]) => {
          const employees = rows;
          console.log("\n");
          console.table(employees);
        })
        .then(loadMainPrompts);
    });
}

// Function to add an employee
function addEmployee() {
  prompt([
    {
      name: "first_name",
      message: "Enter the employee's first name:"
    },
    {
      name: "last_name",
      message: "Enter the employee's last name:"
    }
  ])
    .then(res => {
      const firstName = res.first_name;
      const lastName = res.last_name;

      db.findAllRoles()
        .then(([rows]) => {
          const roles = rows;
          const roleChoices = roles.map(({ id, title }) => ({
            name: title,
            value: id
          }));

          prompt({
            type: "list",
            name: "roleId",
            message: "Choose the employee's role:",
            choices: roleChoices
          })
            .then(res => {
              const roleId = res.roleId;

              db.findAllEmployees()
                .then(([rows]) => {
                  const employees = rows;
                  const managerChoices = employees.map(({ id, first_name, last_name }) => ({
                    name: `${first_name} ${last_name}`,
                    value: id
                  }));

                  managerChoices.unshift({ name: "None", value: null });

                  prompt({
                    type: "list",
                    name: "managerId",
                    message: "Choose the employee's manager:",
                    choices: managerChoices
                  })
                    .then(res => {
                      const employee = {
                        first_name: firstName,
                        last_name: lastName,
                        role_id: roleId,
                        manager_id: res.managerId
                      };

                      db.createEmployee(employee);
                    })
                    .then(() => console.log(`\nEmployee ${firstName} ${lastName} added successfully!\n`))
                    .then(loadMainPrompts);
                });
            });
        });
    });
}

// Function to remove an employee
function removeEmployee() {
  db.findAllEmployees()
    .then(([rows]) => {
      const employees = rows;
      const employeeChoices = employees.map(({ id, first_name, last_name }) => ({
        name: `${first_name} ${last_name}`,
        value: id
      }));

      prompt([
        {
          type: "list",
          name: "employeeId",
          message: "Choose an employee to remove:",
          choices: employeeChoices
        }
      ])
        .then(res => db.removeEmployee(res.employeeId))
        .then(() => console.log("Employee removed successfully!\n"))
        .then(loadMainPrompts);
    });
}

// Function to update an employee's role
function updateEmployeeRole() {
  db.findAllEmployees()
    .then(([rows]) => {
      const employees = rows;
      const employeeChoices = employees.map(({ id, first_name, last_name }) => ({
        name: `${first_name} ${last_name}`,
        value: id
      }));

      prompt([
        {
          type: "list",
          name: "employeeId",
          message: "Choose an employee to update:",
          choices: employeeChoices
        }
      ])
        .then(res => {
          const employeeId = res.employeeId;

          db.findAllRoles()
            .then(([rows]) => {
              const roles = rows;
              const roleChoices = roles.map(({ id, title }) => ({
                name: title,
                value: id
              }));

              prompt([
                {
                  type: "list",
                  name: "roleId",
                  message: "Choose the employee's new role:",
                  choices: roleChoices
                }
              ])
                .then(res => db.updateEmployeeRole(employeeId, res.roleId))
                .then(() => console.log("Employee role updated successfully!\n"))
                .then(loadMainPrompts);
            });
        });
    });
}

// Function to update an employee's manager
function updateEmployeeManager() {
  db.findAllEmployees()
    .then(([rows]) => {
      const employees = rows;
      const employeeChoices = employees.map(({ id, first_name, last_name }) => ({
        name: `${first_name} ${last_name}`,
        value: id
      }));

      prompt([
        {
          type: "list",
          name: "employeeId",
          message: "Choose an employee to update:",
          choices: employeeChoices
        }
      ])
        .then(res => {
          const employeeId = res.employeeId;

          db.findAllPossibleManagers(employeeId)
            .then(([rows]) => {
              const managers = rows;
              const managerChoices = managers.map(({ id, first_name, last_name }) => ({
                name: `${first_name} ${last_name}`,
                value: id
              }));

              prompt([
                {
                  type: "list",
                  name: "managerId",
                  message: "Choose the employee's new manager:",
                  choices: managerChoices
                }
              ])
                .then(res => db.updateEmployeeManager(employeeId, res.managerId))
                .then(() => console.log("Employee manager updated successfully!\n"))
                .then(loadMainPrompts);
            });
        });
    });
}

// Function to view all departments
function viewDepartments() {
  db.findAllDepartments()
    .then(([rows]) => {
      const departments = rows;
      console.log("\n");
      console.table(departments);
    })
    .then(loadMainPrompts);
}

// Function to add a department
function addDepartment() {
  prompt([
    {
      name: "name",
      message: "Enter the department name:"
    }
  ])
    .then(res => {
      const name = res.name;
      db.createDepartment(name)
        .then(() => console.log(`\nDepartment ${name} added successfully!\n`))
        .then(loadMainPrompts);
    });
}

// Function to remove a department
function removeDepartment() {
  db.findAllDepartments()
    .then(([rows]) => {
      const departments = rows;
      const departmentChoices = departments.map(({ id, name }) => ({
        name: name,
        value: id
      }));

      prompt([
        {
          type: "list",
          name: "departmentId",
          message: "Choose a department to remove:",
          choices: departmentChoices
        }
      ])
        .then(res => db.removeDepartment(res.departmentId))
        .then(() => console.log("Department removed successfully!\n"))
        .then(loadMainPrompts);
    });
}

// Function to view the total utilized budget by department
function viewUtilizedBudgetByDepartment() {
  db.findAllDepartments()
    .then(([rows]) => {
      const departments = rows;
      const departmentChoices = departments.map(({ id, name }) => ({
        name: name,
        value: id
      }));

      prompt([
        {
          type: "list",
          name: "departmentId",
          message: "Choose a department:",
          choices: departmentChoices
        }
      ])
        .then(res => db.getUtilizedBudgetByDepartment(res.departmentId))
        .then(([rows]) => {
          const budget = rows[0].utilized_budget;
          console.log(`\nTotal Utilized Budget: $${budget}\n`);
        })
        .then(loadMainPrompts);
    });
}

// Function to view all roles
function viewRoles() {
  db.findAllRoles()
    .then(([rows]) => {
      const roles = rows;
      console.log("\n");
      console.table(roles);
    })
    .then(loadMainPrompts);
}

// Function to add a role
function addRole() {
  db.findAllDepartments()
    .then(([rows]) => {
      const departments = rows;
      const departmentChoices = departments.map(({ id, name }) => ({
        name: name,
        value: id
      }));

      prompt([
        {
          name: "title",
          message: "Enter the role title:"
        },
        {
          name: "salary",
          message: "Enter the role salary:"
        },
        {
          type: "list",
          name: "departmentId",
          message: "Choose the role department:",
          choices: departmentChoices
        }
      ])
        .then(res => {
          const role = {
            title: res.title,
            salary: res.salary,
            department_id: res.departmentId
          };

          db.createRole(role);
        })
        .then(() => console.log(`\nRole ${res.title} added successfully!\n`))
        .then(loadMainPrompts);
    });
}

// Function to remove a role
function removeRole() {
  db.findAllRoles()
    .then(([rows]) => {
      const roles = rows;
      const roleChoices = roles.map(({ id, title }) => ({
        name: title,
        value: id
      }));

      prompt([
        {
          type: "list",
          name: "roleId",
          message: "Choose a role to remove:",
          choices: roleChoices
        }
      ])
        .then(res => db.removeRole(res.roleId))
        .then(() => console.log("Role removed successfully!\n"))
        .then(loadMainPrompts);
    });
}

// Function to quit the program
function quit() {
  console.log("Goodbye!");
  process.exit();
}
