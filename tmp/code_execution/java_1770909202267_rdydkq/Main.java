public class Main {
    public class Main {
    public static int yourFunction(int n) {
        // Ваш код здесь
        return n + 1;
    }

    public static void main(String[] args) {
        try {
            // Создаем экземпляр класса и вызываем метод
            Main main = new Main();
            System.out.println(main.yourFunction(5));
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
        }
    }
}