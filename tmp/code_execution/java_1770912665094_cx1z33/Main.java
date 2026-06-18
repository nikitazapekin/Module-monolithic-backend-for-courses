public class Main {
    public static int yourFunction(int n) {
        // Ваш код здесь
        return n + 1;
    }


    public static void main(String[] args) {

        // Тест 1
        try {
            Object result = yourFunction(2);
            System.out.println("===TEST_START_" + 1 + "===");
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
            System.out.println("===TEST_END_" + 1 + "===");
        } catch (Exception e) {
            System.out.println("===TEST_START_" + 1 + "===");
            System.out.println("ERROR: " + e.getMessage());
            System.out.println("===TEST_END_" + 1 + "===");
        }

        // Тест 2
        try {
            Object result = yourFunction(5);
            System.out.println("===TEST_START_" + 2 + "===");
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
            System.out.println("===TEST_END_" + 2 + "===");
        } catch (Exception e) {
            System.out.println("===TEST_START_" + 2 + "===");
            System.out.println("ERROR: " + e.getMessage());
            System.out.println("===TEST_END_" + 2 + "===");
        }
    }
}