public class Main {
    public static int yourFunction(int n) {
        // Ваш код здесь
        return n + 1;
    }

    public static void main(String[] args) {
        try {
            System.out.println(yourFunction(4));
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
        }
    }
}