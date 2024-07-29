using AIService.Dtos;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using RestSharp;
using System.Security.Principal;

namespace AIService
{
    public class AIServer : IAIService
    {
        private readonly IConfiguration _configuration;

        public AIServer(IConfiguration configuration)
        {
            _configuration = configuration;
        }
        public ResultSQL GetSQLConvert(string systemPrompt, string prompt)
        {
            ResultSQL result = new ResultSQL();
            string callAIResult = CallAI(systemPrompt, prompt);
            if (!string.IsNullOrEmpty(callAIResult))
                result = JsonConvert.DeserializeObject<ResultSQL>(callAIResult);
            return result;
        }
        private string CallAI(string systemPrompt, string prompt)
        {
            string baseUrl = _configuration["OpenAI:BaseUrl"];
            if (!string.IsNullOrEmpty(baseUrl))
                baseUrl = baseUrl.TrimEnd('/');
            string apiKey = _configuration["OpenAI:ApiKey"];
            string model = _configuration["OpenAI:Model"];
            var url = $"{baseUrl}/v1/chat/completions";
            var client = new RestClient(url);
            var request = new RestRequest("", Method.Post);

            request.AddHeader("Authorization", $"Bearer {apiKey}");
            request.AddHeader("Content-Type", "application/json");
            request.AddHeader("Accept", "*/*");
            request.AddHeader("Connection", "keep-alive");

            var requestBody = new
            {
                model = model,
                response_format = new { type = "json_object" },
                messages = new[]
                        {
                            new { role = "system", content = systemPrompt },
                            new { role = "user", content = prompt }
                         },
                stream = false
            };
            string jsonBody = JsonConvert.SerializeObject(requestBody);
            request.AddParameter("application/json", jsonBody, ParameterType.RequestBody);
            RestResponse response = client.Execute(request);
            if (response.IsSuccessful)
            {
                JObject jsonObj = JsonConvert.DeserializeObject<JObject>(response.Content);
                string content = jsonObj["choices"][0]["message"]["content"].ToString();
                return content;
            }
            else
            {
                return "";
            }
        }

    }
}
