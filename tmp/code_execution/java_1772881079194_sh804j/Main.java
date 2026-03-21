import java.util.*;
public class Solution {
public static int solution(int n) {
    // Ваш код здесь
    if(n==1) {
      return 1;
      }
    return n;

  public static void main(String[] args) {
    Object result = solution(1);
    System.out.println("===RESULT_START_0===");
    System.out.println(result instanceof int[] ? Arrays.toString((int[])result) : String.valueOf(result));
    System.out.println("===RESULT_END_0===");
  }
}