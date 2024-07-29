using AIService.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AIService
{
    public interface IAIService
    {
        ResultSQL GetSQLConvert(string systemPrompt, string prompt);
    }
}
