public class Main {
    public static int yourFunction(int arg1, Test arg2) {
        // Ваш код здесь
        
        if(arg2.getField1()=="dgr") {
          return 23;
          }
      return 0;
    }


    public static void main(String[] args) {
            java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
            java.io.PrintStream originalOut = System.out;
            System.setOut(new java.io.PrintStream(baos));

            try {
                Object result = yourFunction(11, "");
                System.setOut(originalOut);
                
                String logs = baos.toString();
                if (!logs.isEmpty()) {
                    System.out.println("===LOGS_START===");
                    System.out.print(logs);
                    System.out.println("===LOGS_END===");
                }
                
                System.out.println("===RESULT_START_0===");
                if (result == null) {
                    System.out.print("null");
                } else if (result instanceof String) {
                    System.out.print("\"" + result + "\"");
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
                System.out.println("===RESULT_END_0===");
            } catch (Exception e) {
                System.setOut(originalOut);
                System.out.println("===RESULT_START_0===");
                System.out.print("{\"error\":\"" + e.getMessage() + "\"}");
                System.out.println("===RESULT_END_0===");
            }
        }

                // Выводим результат
                System.out.println("===RESULT_START_" + 1 + "===");
                if (result == null) {
                    System.out.print("null");
                } else if (result instanceof String) {
                    System.out.print("\"" + result + "\"");
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
    }
}