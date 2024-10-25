using System.Net;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Aibidia.Homework.API.Filters;

public class ValidateModelAttribute : ActionFilterAttribute
{
    public override void OnActionExecuting(ActionExecutingContext context)
    {
        if (!context.ModelState.IsValid)
        {
            var modelStateErrors = context.ModelState.Values
                .SelectMany(value => 
                    value.Errors.Select(e => e.ErrorMessage));
            var errorMessage = string.Join(" ", modelStateErrors);
            context.Result = new ObjectResult(errorMessage)
            {
                StatusCode = (int)HttpStatusCode.BadRequest
            };
        }
    }
}
