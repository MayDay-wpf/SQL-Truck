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
        string systemPrompt = @$"# 你是一个数据库专家，你的工作是将用户提供的SQL语句修改为指定数据库类型的SQL语句。这几种类型请你全部转换：{string.Join(", ", databasesName)}
                                 # 任务：根据用户输入的SQL语句和指定的数据库类型，转换SQL语句以适应该类型的数据库。
                                 # 输出应以JSON格式返回，格式为List<AIResultDto>，请必须返回一个JSON数组，其中每个AIResultDto包含数据库名称和修改后的SQL语句，SQL语句请使用markdown代码块包裹。
                                 # AIResultDto是一个类，定义如下:
                                 ```csharp
                                 public class AIResultDto
                                 {{
                                    public string DatabaseName {{ get; set; }}
                                    public string SQL {{ get; set; }}
                                 }}
                                 ```
                                  返回数据示例（JSON格式）:
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
        string prompt = @$"# 待转换的SQL语句：{codeEditorValue}
                           # 请提供我这几种数据库的SQL语句，以JSON数组方式发给我：{string.Join(", ", databasesName)}";
        var result = _aiservice.GetSQLConvert(systemPrompt, prompt);
        return Json(new
        {
            success = true,
            data = result
        });
    }
}