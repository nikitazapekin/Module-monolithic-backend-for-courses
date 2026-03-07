import java.util.*;
public class Solution {

    public static int solution(int n) {
       
        return 6;
    }

    
                    System.out.println("===LOGS_END_" + 1 + "===");
                }
                
                // Выводим результат
                System.out.println("===RESULT_START_" + 1 + "===");
                if (result == null) {
                    System.out.print("null");
                } else if (result instanceof String) {
                    System.out.print(result);
                } else if (result.getClass().isArray()) {
                    if (result instanceof int[]) {
                        System.out.print(java.util.Arrays.toString((int[])result));
                    } else if (result instanceof Integer[]) {
                        System.out.print(java.util.Arrays.toString((Integer[])result));
                    } else if (result instanceof String[]) {
                        System.out.print(java.util.Arrays.toString((String[])result));
                    } else {
                        System.out.print(java.util.Arrays.toString((Object[])result));
                    }
                } else {
                    System.out.print(result);
                }
                System.out.println();
                System.out.println("===RESULT_END_" + 1 + "===");
                
            } catch (Exception e) {
                System.setOut(originalOut);
                System.out.println("===RESULT_START_" + 1 + "===");
                System.out.print(e.getMessage());
                System.out.println();
                System.out.println("===RESULT_END_" + 1 + "===");
            }
        }

        // Тест 2
        {
            // Перехватываем System.out для этого теста
            java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
            java.io.PrintStream originalOut = System.out;
            System.setOut(new java.io.PrintStream(baos));
            
            try {
                Object result = solution(1, 2);
                
                // Восстанавливаем System.out
                System.setOut(originalOut);
                
                // Получаем логи для этого теста
                String logs = baos.toString();
                
                // Выводим логи, если они есть
                if (logs != null && !logs.isEmpty()) {
                    System.out.println("===LOGS_START_" + 2 + "===");
                    System.out.print(logs);
                    if (!logs.endsWith("\n")) {
                        System.out.println();
                    }
                    System.out.println("===LOGS_END_" + 2 + "===");
                }
                
                // Выводим результат
                System.out.println("===RESULT_START_" + 2 + "===");
                if (result == null) {
                    System.out.print("null");
                } else if (result instanceof String) {
                    System.out.print(result);
                } else if (result.getClass().isArray()) {
                    if (result instanceof int[]) {
                        System.out.print(java.util.Arrays.toString((int[])result));
                    } else if (result instanceof Integer[]) {
                        System.out.print(java.util.Arrays.toString((Integer[])result));
                    } else if (result instanceof String[]) {
                        System.out.print(java.util.Arrays.toString((String[])result));
                    } else {
                        System.out.print(java.util.Arrays.toString((Object[])result));
                    }
                } else {
                    System.out.print(result);
                }
                System.out.println();
                System.out.println("===RESULT_END_" + 2 + "===");
                
            } catch (Exception e) {
                System.setOut(originalOut);
                System.out.println("===RESULT_START_" + 2 + "===");
                System.out.print(e.getMessage());
                System.out.println();
                System.out.println("===RESULT_END_" + 2 + "===");
            }
        }

        // Тест 3
        {
            // Перехватываем System.out для этого теста
            java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
            java.io.PrintStream originalOut = System.out;
            System.setOut(new java.io.PrintStream(baos));
            
            try {
                Object result = solution({"studentName":"John Doe"});
                
                // Восстанавливаем System.out
                System.setOut(originalOut);
                
                // Получаем логи для этого теста
                String logs = baos.toString();
                
                // Выводим логи, если они есть
                if (logs != null && !logs.isEmpty()) {
                    System.out.println("===LOGS_START_" + 3 + "===");
                    System.out.print(logs);
                    if (!logs.endsWith("\n")) {
                        System.out.println();
                    }
                    System.out.println("===LOGS_END_" + 3 + "===");
                }
                
                // Выводим результат
                System.out.println("===RESULT_START_" + 3 + "===");
                if (result == null) {
                    System.out.print("null");
                } else if (result instanceof String) {
                    System.out.print(result);
                } else if (result.getClass().isArray()) {
                    if (result instanceof int[]) {
                        System.out.print(java.util.Arrays.toString((int[])result));
                    } else if (result instanceof Integer[]) {
                        System.out.print(java.util.Arrays.toString((Integer[])result));
                    } else if (result instanceof String[]) {
                        System.out.print(java.util.Arrays.toString((String[])result));
                    } else {
                        System.out.print(java.util.Arrays.toString((Object[])result));
                    }
                } else {
                    System.out.print(result);
                }
                System.out.println();
                System.out.println("===RESULT_END_" + 3 + "===");
                
            } catch (Exception e) {
                System.setOut(originalOut);
                System.out.println("===RESULT_START_" + 3 + "===");
                System.out.print(e.getMessage());
                System.out.println();
                System.out.println("===RESULT_END_" + 3 + "===");
            }
        }
    }

  public static void main(String[] args) {
    Object result = solution(1);
    System.out.println("===RESULT_START_0===");
    System.out.println(result instanceof int[] ? Arrays.toString((int[])result) : String.valueOf(result));
    System.out.println("===RESULT_END_0===");
  }
}