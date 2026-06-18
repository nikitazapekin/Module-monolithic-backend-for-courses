using System;
using System.IO;
using System.Text;
using System.Text.Json;
using System.Collections.Generic;


public class Program
{
    public static int YourFunction(int n, int z)
    {
        // Ваш код здесь
        Console.WriteLine("HELLO", n, z);
        if(n == 3 && z == 6) {
            return 7;
        }
        return 6;
    }
}
    
public class Runner {
    public static void Main() {

        // Тест 1
        {
            var originalOut = Console.Out;
            var originalError = Console.Error;
            var outWriter = new StringWriter();
            var errorWriter = new StringWriter();
            Console.SetOut(outWriter);
            Console.SetError(errorWriter);
            
            try {
                var result = Program.YourFunction(3, 6);
                
                Console.SetOut(originalOut);
                Console.SetError(originalError);
                
                var outLogs = outWriter.ToString();
                var errorLogs = errorWriter.ToString();
                
                // Выводим логи если есть
                if (!string.IsNullOrEmpty(outLogs) || !string.IsNullOrEmpty(errorLogs)) {
                    Console.WriteLine("===LOGS_START_" + 1 + "===");
                    if (!string.IsNullOrEmpty(outLogs)) {
                        Console.Write(outLogs);
                    }
                    if (!string.IsNullOrEmpty(errorLogs)) {
                        Console.Write("ERROR: " + errorLogs);
                    }
                    if (!outLogs.EndsWith("\n") && !errorLogs.EndsWith("\n")) {
                        Console.WriteLine();
                    }
                    Console.WriteLine("===LOGS_END_" + 1 + "===");
                }
                
                // Выводим результат
                Console.WriteLine("===RESULT_START_" + 1 + "===");
                Console.WriteLine(System.Text.Json.JsonSerializer.Serialize(result));
                Console.WriteLine("===RESULT_END_" + 1 + "===");
                
            } catch (Exception e) {
                Console.SetOut(originalOut);
                Console.SetError(originalError);
                Console.WriteLine("===RESULT_START_" + 1 + "===");
                Console.WriteLine(System.Text.Json.JsonSerializer.Serialize(new { error = e.Message }));
                Console.WriteLine("===RESULT_END_" + 1 + "===");
            }
        }
    }
}