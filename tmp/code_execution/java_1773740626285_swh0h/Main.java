public class Main {
  public static int[] yourFunction(int[] arg1) {
        System.out.println("HELLO" + " " + java.util.Arrays.toString(arg1));
        
        // Сортировка пузырьком
        int n = arg1.length;
        int[] sortedArray = arg1.clone(); // Создаем копию, чтобы не изменять исходный массив
        
        for (int i = 0; i < n - 1; i++) {
            for (int j = 0; j < n - i - 1; j++) {
                if (sortedArray[j] > sortedArray[j + 1]) {
                    // Меняем элементы местами
                    int temp = sortedArray[j];
                    sortedArray[j] = sortedArray[j + 1];
                    sortedArray[j + 1] = temp;
                }
            }
        }
        
        return sortedArray;
    }


    public static void main(String[] args) {

        // Тест 1
        {
            java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
            java.io.PrintStream originalOut = System.out;
            System.setOut(new java.io.PrintStream(baos));
            
            try {
                Object result = yourFunction(new int[] { 3, 2, 1 });
                
                System.setOut(originalOut);
                
                String logs = baos.toString();
                
                // Выводим логи если есть
                if (logs != null && !logs.isEmpty()) {
                    System.out.println("===LOGS_START_" + 1 + "===");
                    System.out.print(logs);
                    if (!logs.endsWith("\n")) {
                        System.out.println();
                    }
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
                System.out.println();
                System.out.println("===RESULT_END_" + 1 + "===");
                
            } catch (Exception e) {
                System.setOut(originalOut);
                System.out.println("===RESULT_START_" + 1 + "===");
                System.out.print("ERROR: " + e.getMessage());
                System.out.println();
                System.out.println("===RESULT_END_" + 1 + "===");
            }
        }

        // Тест 2
        {
            java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
            java.io.PrintStream originalOut = System.out;
            System.setOut(new java.io.PrintStream(baos));
            
            try {
                Object result = yourFunction(new int[] { 2, 5, 1, 6 });
                
                System.setOut(originalOut);
                
                String logs = baos.toString();
                
                // Выводим логи если есть
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
                System.out.println();
                System.out.println("===RESULT_END_" + 2 + "===");
                
            } catch (Exception e) {
                System.setOut(originalOut);
                System.out.println("===RESULT_START_" + 2 + "===");
                System.out.print("ERROR: " + e.getMessage());
                System.out.println();
                System.out.println("===RESULT_END_" + 2 + "===");
            }
        }
    }
}