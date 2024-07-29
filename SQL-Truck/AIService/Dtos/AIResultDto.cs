using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AIService.Dtos
{
    public class ResultSQL
    {
        public List<AIResultDto> AIResultDto { get; set; }
    }
    public class AIResultDto
    {
        public string DatabaseName { get; set; }
        public string SQL { get; set; }
    }
}
