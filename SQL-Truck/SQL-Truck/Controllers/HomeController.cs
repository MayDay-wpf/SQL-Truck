using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace SQL_Truck.Controllers;

public class HomeController : Controller
{
    public IActionResult Index()
    {
        return View();
    }
}