public class Main {
    public static Object yourFunction(int n, int z,int b) {
      if(b==3) {
        return 4;
}
        if(n == 3 && z == 6) {
            return new int[]{1, 2, 3, 5};
        }
        return 6;
    }


    public static void main(String[] args) {

        // Тест 1
        {
            // Перехватываем System.out для этого теста
            java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
            java.io.PrintStream originalOut = System.out;
            System.setOut(new java.io.PrintStream(baos));
            
            try {
                Object result = yourFunction(3, 5);
                
                // Восстанавливаем System.out
                System.setOut(originalOut);
                
                // Получаем логи для этого теста
                String logs = baos.toString();
                
                // Выводим логи, если они есть
                if (!logs.isEmpty()) {
                    System.out.println("===LOGS_START_" + 1 + "===");
                    System.out.print(logs);
                    System.out.println("===LOGS_END_" + 1 + "===");
                }
                
                // Выводим результат
                System.out.println("===RESULT_START_" + 1 + "===");
                if (result == null) {
                    System.out.print("null");
                } else if (result instanceof String) {
                    System.out.print("\"");
                    System.out.print(result);
                    System.out.print("\"");
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
                System.out.println("===RESULT_END_" + 1 + "===");
                
            } catch (Exception e) {
                System.setOut(originalOut);
                System.out.println("===RESULT_START_" + 1 + "===");
                System.out.print("{\"error\":\"" + e.getMessage() + "\"}");
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
                Object result = yourFunction(1, 2, 3);
                
                // Восстанавливаем System.out
                System.setOut(originalOut);
                
                // Получаем логи для этого теста
                String logs = baos.toString();
                
                // Выводим логи, если они есть
                if (!logs.isEmpty()) {
                    System.out.println("===LOGS_START_" + 2 + "===");
                    System.out.print(logs);
                    System.out.println("===LOGS_END_" + 2 + "===");
                }
                
                // Выводим результат
                System.out.println("===RESULT_START_" + 2 + "===");
                if (result == null) {
                    System.out.print("null");
                } else if (result instanceof String) {
                    System.out.print("\"");
                    System.out.print(result);
                    System.out.print("\"");
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
                System.out.println("===RESULT_END_" + 2 + "===");
                
            } catch (Exception e) {
                System.setOut(originalOut);
                System.out.println("===RESULT_START_" + 2 + "===");
                System.out.print("{\"error\":\"" + e.getMessage() + "\"}");
                System.out.println("===RESULT_END_" + 2 + "===");
            }
        }
    }
}