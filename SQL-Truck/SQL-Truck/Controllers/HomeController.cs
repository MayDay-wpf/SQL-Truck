using System.Diagnostics;
using AIService;
using Microsoft.AspNetCore.Mvc;

namespace SQL_Truck.Controllers;

public class HomeController : Controller
{
    private readonly IAIService _aiservice;
    public HomeController(IAIService aiservice)
    {
        _aiservice = aiservice;
    }
    public IActionResult Index()
    {
        return View();
    }
    public IActionResult GetSQLConvert(List<string> databasesName, string codeEditorValue)
    {
        if (databasesName.Count == 0 || string.IsNullOrEmpty(codeEditorValue))
            return Json(new
            {
                success = false
            });
        string systemPrompt = @$"# You are a database expert, and your job is to modify SQL statements provided by users to fit specific database types. Please convert for all these types: {{string.Join("", "", databasesName)}}
                                 # Task 1: Based on the SQL statement input by the user and the specified database type, transform the SQL statement to adapt to that database type.
                                 # Task 2: Refuse to answer any questions outside of SQL statement conversion, including but not limited to chats, programming, translation, mathematics, law, finance, history, politics.
                                 # The output should be returned in JSON format, formatted as a List<AIResultDto>. You must return a JSON array where each AIResultDto contains the database name and the modified SQL statement, which should be enclosed in markdown code blocks.
                                 # AIResultDto is a class, defined as follows:
                                 ```csharp
                                 public class AIResultDto
                                 {{
                                    public string DatabaseName {{ get; set; }}
                                    public string SQL {{ get; set; }}
                                 }}
                                 ```
                                  Sample returned data (JSON format):
                                  ```json
                                  {{ 
                                     'AIResultDto':[
                                         {{
                                             'DatabaseName': 'MySQL',
                                             'SQL': '```sql
                                                     ALTER TABLE Example MODIFY COLUMN a VARCHAR(255);
                                                     ```'
                                         }},
                                         {{
                                             'DatabaseName': 'PostgreSQL',
                                             'SQL': '```sql
                                                     ALTER TABLE Example ALTER COLUMN a TYPE VARCHAR(255); 
                                                    ```'
                                         }}
                                      ]
                                  }}
                                  ```
                                  ";
        string prompt = @$"# The SQL statement to be transformed：{codeEditorValue}
                           # Please provide me the SQL statements of these databases and send them to me in JSON array：{string.Join(", ", databasesName)}";
        var result = _aiservice.GetSQLConvert(systemPrompt, prompt);
        return Json(new
        {
            success = true,
            data = result
        });
    }
}