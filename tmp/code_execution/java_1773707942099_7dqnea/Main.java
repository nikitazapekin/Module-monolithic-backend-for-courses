public class Main {
    public static int yourFunction(Person arg1) {
        // Ваш код здесь
        System.out.println("HELLO" + " " + arg1);
        return arg1.getField1();
    }
}

    static class Person {
        private int field1;

    public int getField1() {
        return field1;
    }
    public void setField1(int field1) {
        this.field1 = field1;
    }
    

    public static void main(String[] args) {

        // Тест 1
        {
            java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
            java.io.PrintStream originalOut = System.out;
            System.setOut(new java.io.PrintStream(baos));
            
            try {
                Object result = yourFunction(new Person(11));
                
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
    }
}