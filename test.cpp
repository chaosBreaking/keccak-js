#include <iostream>
#include "./keccak.cpp"
using namespace std;
int main() {
	Keccak k(1600);
	std::cout << k.w << k.l << k.b << keccak::RC;
	return 0;
}
